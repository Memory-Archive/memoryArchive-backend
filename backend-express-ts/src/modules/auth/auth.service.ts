import type { Request, Response } from "express";
import { IsNull } from "typeorm";
import { DBService } from "../../DB/db.service";
import { AuthSession, PasswordResetToken, User } from "../../DB/models";
import {
  ConflictException,
  ForbiddenException,
  NotImplementedException,
  UnauthorizedException,
} from "../../utils/errors/app.error";
import { successResponse } from "../../utils/response/success.response";
import { hashPassword, verifyPassword } from "../../utils/security/hash";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
  generateRefreshToken,
  hashToken,
  signAccessToken,
} from "../../utils/security/token";
import type { LoginDTO, RefreshTokenDTO, SignupDTO } from "./auth.validation";

class AuthService {
  private readonly userModel = new DBService(User);
  private readonly sessionModel = new DBService(AuthSession);
  private readonly resetTokenModel = new DBService(PasswordResetToken);

  // POST /auth/signup
  // Check for a taken email/username (friendly 409), hash the password, insert the user.
  // The unique indexes still guard against races: a concurrent duplicate insert
  // surfaces as ER_DUP_ENTRY, which the global error handler turns into a 409.
  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password, displayName } = req.body as SignupDTO;

    // withDeleted: soft-deleted users still occupy the unique email/username in MySQL.
    const existing = await this.userModel.findOne({
      where: [{ email }, { username }],
      select: { id: true, email: true },
      withDeleted: true,
    });
    if (existing) {
      throw new ConflictException(
        existing.email === email ? "Email is already registered" : "Username is already taken",
      );
    }

    const user = await this.userModel.create({
      username,
      email,
      passwordHash: await hashPassword(password),
      displayName: displayName ?? null,
    });

    // save() returns the entity we passed in, so strip the hash before responding.
    const { passwordHash: _omit, ...safeUser } = user;
    return successResponse(res, { status: 201, message: "Account created", data: { user: safeUser } });
  };

  // POST /auth/login
  // Verify credentials, open a new AuthSession (one per login/device) and return
  // a short-lived access token (JWT) plus a long-lived refresh token (opaque, stored hashed).
  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password, deviceName } = req.body as LoginDTO;

    // passwordHash is `select: false` on the entity, so add it explicitly.
    // The query builder skips soft-deleted users (deleted_at IS NOT NULL) by default.
    const user = await this.userModel.repo
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.email = :email", { email })
      .getOne();

    // Same message for both failure cases.
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Checked only after the password, so account status isn't leaked to someone guessing.
    if (user.status !== "active") {
      throw new ForbiddenException("This account is disabled");
    }

    const tokens = await this.openSession(req, user.id, deviceName ?? null);

    const now = new Date();
    await this.userModel.update({ id: user.id }, { lastLoginAt: now });

    const { passwordHash: _omit, ...safeUser } = user;
    return successResponse(res, {
      message: "Logged in",
      data: { user: { ...safeUser, lastLoginAt: now }, ...tokens },
    });
  };

  /**
   * Creates an AuthSession row and the token pair that belongs to it.
   * The raw refresh token is returned to the client once and never stored;
   * the access token carries the session id (`sid`) so it can be checked against revocation.
   * Reused by /refresh for rotation.
   */
  private openSession = async (req: Request, userId: string, deviceName: string | null) => {
    const refreshToken = generateRefreshToken();

    const session = await this.sessionModel.create({
      userId,
      refreshTokenHash: hashToken(refreshToken),
      deviceName,
      ipAddress: req.ip ?? null,
      userAgent: req.get("user-agent")?.slice(0, 512) ?? null,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
    });

    return {
      tokenType: "Bearer" as const,
      accessToken: signAccessToken({ sub: userId, sid: session.id }),
      accessTokenExpiresIn: ACCESS_TOKEN_TTL_SECONDS,
      refreshToken,
      refreshTokenExpiresAt: session.expiresAt,
    };
  };

  // POST /auth/refresh
  // Hash the incoming token, find a session that is not revoked and not expired,
  // rotate: revoke it and issue a new session + tokens.
  refresh = async (req: Request, res: Response): Promise<Response> => {
    const { refreshToken } = req.body as RefreshTokenDTO;
    const invalid = () => new UnauthorizedException("Invalid or expired refresh token");

    // Only the hash is stored, so look the session up by hashing what the client sent.
    const session = await this.sessionModel.findOneBy({ refreshTokenHash: hashToken(refreshToken) });
    if (!session) throw invalid();

    // A revoked token being presented again means it was used twice: either the
    // client or an attacker holds a stale copy. We can't tell which, so end every
    // session for that user and make them log in again.
    if (session.revokedAt) {
      await this.sessionModel.update({ userId: session.userId, revokedAt: IsNull() }, { revokedAt: new Date() });
      throw invalid();
    }

    if (session.expiresAt <= new Date()) throw invalid();

    // Claim the token atomically: only one request can flip revokedAt from NULL,
    // so two concurrent refreshes with the same token can't both succeed.
    const claimed = await this.sessionModel.update({ id: session.id, revokedAt: IsNull() }, { revokedAt: new Date() });
    if (claimed === 0) throw invalid();

    // The account may have been disabled or deleted since login (soft-deleted users are excluded here).
    const user = await this.userModel.findOneBy({ id: session.userId });
    if (!user || user.status !== "active") throw invalid();

    const tokens = await this.openSession(req, user.id, session.deviceName);
    return successResponse(res, { message: "Token refreshed", data: tokens });
  };

  // POST /auth/logout
  // Revoke the session that owns this refresh token. Idempotent: an unknown, expired
  // or already-revoked token still gets 200, since the end state (logged out) is the same.
  logout = async (req: Request, res: Response): Promise<Response> => {
    const { refreshToken } = req.body as RefreshTokenDTO;

    // revokedAt IS NULL keeps the original revocation time on repeat logouts.
    await this.sessionModel.update(
      { refreshTokenHash: hashToken(refreshToken), revokedAt: IsNull() },
      { revokedAt: new Date() },
    );

    return successResponse(res, { message: "Logged out" });
  };

  // POST /auth/forgot-password
  // Always respond 200 (don't leak which emails exist). Create a PasswordResetToken (hashed) and email it.
  forgotPassword = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /auth/reset-password
  // Find an unused, unexpired token by hash; update password; set usedAt; revoke all user sessions.
  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new AuthService();
