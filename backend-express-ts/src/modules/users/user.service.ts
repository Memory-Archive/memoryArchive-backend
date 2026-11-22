import type { Request, Response } from "express";
import { Not } from "typeorm";
import { DBService } from "../../DB/db.service";
import { AuthSession, User } from "../../DB/models";
import { currentUserId } from "../../middleware/authentication.middleware";
import { ConflictException, NotImplementedException, UnauthorizedException } from "../../utils/errors/app.error";
import { successResponse } from "../../utils/response/success.response";
import type { UpdateProfileDTO } from "./user.validation";

class UserService {
  private readonly userModel = new DBService(User);
  private readonly sessionModel = new DBService(AuthSession);

  // GET /users/me
  // authentication() already loaded the active user into req.user. passwordHash is
  // `select: false` on the entity, so it was never fetched and can't leak here.
  getMe = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) throw new UnauthorizedException();
    return successResponse(res, { data: { user: req.user } });
  };

  // PATCH /users/me
  // Partial update of username / displayName / bio. The validation schema strips any
  // other field, so email, status, passwordHash etc. can't be changed here.
  // Sending null for displayName or bio clears it; omitting a field leaves it unchanged.
  updateMe = async (req: Request, res: Response): Promise<Response> => {
    const userId = currentUserId(req);
    const changes = req.body as UpdateProfileDTO;

    // Friendly 409 for a taken username. Excludes the caller so changing only the
    // letter case of your own name works (the column's collation is case-insensitive).
    // withDeleted: soft-deleted users still hold their username in the unique index.
    // The unique index still guards races; ER_DUP_ENTRY becomes a 409 globally.
    if (changes.username !== undefined) {
      const taken = await this.userModel.repo.exists({
        where: { username: changes.username, id: Not(userId) },
        withDeleted: true,
      });
      if (taken) throw new ConflictException("Username is already taken");
    }

    await this.userModel.update({ id: userId }, changes);

    // Re-read so the response has the stored values, including the new updatedAt.
    const user = await this.userModel.findOneBy({ id: userId });
    return successResponse(res, { message: "Profile updated", data: { user } });
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
