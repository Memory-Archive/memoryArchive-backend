import type { Request, Response } from "express";
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
import type { LoginDTO, SignupDTO } from "./auth.validation";

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

    // Always run scrypt, even for unknown emails, so response time doesn't reveal
    // whether an email is registered. Same message for both failure cases.
    const passwordOk = await verifyPassword(password, user?.passwordHash ?? (await this.getDummyHash()));
    if (!user || !passwordOk) {
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

  // A real scrypt hash of a random password, computed once and reused for unknown-email logins.
  private dummyHash?: Promise<string>;
  private getDummyHash = (): Promise<string> =>
    (this.dummyHash ??= hashPassword(generateRefreshToken()));

  // POST /auth/refresh
  // Hash the incoming token, find a session that is not revoked and not expired,
  // rotate: revoke it and issue a new session + tokens.
  refresh = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /auth/logout  - set revokedAt on the session matching the refresh token.
  logout = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
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
