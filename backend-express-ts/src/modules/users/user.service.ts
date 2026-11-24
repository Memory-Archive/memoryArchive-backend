import type { Request, Response } from "express";
import { Not } from "typeorm";
import { DBService } from "../../DB/db.service";
import { AuthSession, User } from "../../DB/models";
import { currentUserId } from "../../middleware/authentication.middleware";
import { ConflictException, NotFoundException, NotImplementedException, UnauthorizedException } from "../../utils/errors/app.error";
import { successResponse } from "../../utils/response/success.response";
import type { UpdateProfileDTO } from "./user.validation";

/**
 * TODO (after the friendships table exists) - profile changes for friends:
 *   - GET /users/:userId: add `friendshipStatus` for the viewer
 *     ('none' | 'request_sent' | 'request_received' | 'friends') so the app knows
 *     which button to show (Add / Cancel / Accept / Unfriend).
 *   - GET /users/:userId: add `friendsCount` (and `memoriesCount` of memories the
 *     viewer is allowed to see). Never expose private memories or counts of them.
 *   - GET /users/me: add `friendsCount` and pending friend requests count.
 *   - New: GET /users/search?q=username so people can find each other to add as friends.
 *   - Privacy reminder: no public content. A non-friend only sees username,
 *     displayName and bio (what getPublicProfile already returns).
 * Friend requests / accept / remove belong in a new `friends` module, not here.
 * Everywhere friends are listed: hide users that are disabled or soft-deleted.
 */
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
  // FRIENDS: friendships only CASCADE on a hard delete, so a soft-deleted user's rows stay.
  // In the same transaction, delete all friendships where they are requester or addressee,
  // otherwise they keep showing up in other people's friend lists and pending requests.
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
  // TODO (friends): add friendshipStatus + counts, see the TODO above the class.
  // `select` limits the query itself to public columns, so private ones (email, status,
  // lastLoginAt...) are never loaded and can't leak if the response shape changes later.
  // Disabled and soft-deleted users get the same 404 as ids that never existed.
  getPublicProfile = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as { userId: string };

    const user = await this.userModel.findOne({
      where: { id: userId, status: "active" },
      select: { id: true, username: true, displayName: true, bio: true },
    });
    if (!user) throw new NotFoundException("User not found");

    return successResponse(res, { data: { user } });
  };
}

export default new UserService();
