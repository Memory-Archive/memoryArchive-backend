import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { AuthSession, PasswordResetToken, User } from "../../DB/models";
import { ConflictException, NotImplementedException } from "../../utils/errors/app.error";
import { successResponse } from "../../utils/response/success.response";
import { hashPassword } from "../../utils/security/hash";
import type { SignupDTO } from "./auth.validation";

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
  // Find the user with `select` including passwordHash, check status/deleted, compare the hash,
  // create an AuthSession (store only a hash of the refresh token), update lastLoginAt,
  // return { accessToken, refreshToken }.
  login = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

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
