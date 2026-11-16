import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { AuthSession, User } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

class UserService {
  private readonly userModel = new DBService(User);
  private readonly sessionModel = new DBService(AuthSession);

  // GET /users/me
  getMe = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /users/me
  updateMe = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /users/me/password  - verify current password, hash new one, revoke other sessions.
  changePassword = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /users/me  - soft delete (sets deleted_at) and revoke all sessions.
  deleteMe = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /users/me/sessions  - active (not revoked, not expired) sessions.
  listSessions = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /users/me/sessions/:sessionId  - revoke one of my sessions.
  revokeSession = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /users/:userId  - public profile (username, displayName, bio only).
  getPublicProfile = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new UserService();
