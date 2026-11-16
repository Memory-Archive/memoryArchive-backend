import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { AuthSession, PasswordResetToken, User } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

class AuthService {
  private readonly userModel = new DBService(User);
  private readonly sessionModel = new DBService(AuthSession);
  private readonly resetTokenModel = new DBService(PasswordResetToken);

  // POST /auth/signup
  // Hash the password; insert user (409 on duplicate email/username comes from the error handler).
  signup = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
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
