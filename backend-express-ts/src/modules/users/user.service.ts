import type { Request, Response } from "express";
import { Not } from "typeorm";
import { DBService } from "../../DB/db.service";
import { AuthSession, Friendship, User } from "../../DB/models";
import { currentUserId } from "../../middleware/authentication.middleware";
import { ConflictException, NotFoundException, NotImplementedException, UnauthorizedException } from "../../utils/errors/app.error";
import { successResponse } from "../../utils/response/success.response";
import type { UpdateProfileDTO } from "./user.validation";

/**
 * TODO:
 *   - New: GET /users/search?q=username so people can find each other to add as friends.
 *     Return only id, username, displayName (same as a non-friend sees on a profile).
 * Friend requests / accept / remove live in the `friends` module, not here.
 * Everywhere friends are listed: hide users that are disabled or soft-deleted.
 */
class UserService {
  private readonly userModel = new DBService(User);
  private readonly sessionModel = new DBService(AuthSession);
  private readonly friendshipModel = new DBService(Friendship);

  // GET /users/me
  // authentication() already loaded the active user into req.user. passwordHash is
  // `select: false` on the entity, so it was never fetched and can't leak here.
  // counts.friends: accepted friendships. counts.pendingFriendRequests: requests sent TO me
  // that I haven't answered. Both skip the other user if they're disabled or soft-deleted.
  getMe = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) throw new UnauthorizedException();
    const userId = req.user.id;

    const [friends, pendingFriendRequests] = await Promise.all([
      this.countFriends(userId),
      this.friendshipModel.repo
        .createQueryBuilder("f")
        .innerJoin(User, "other", "other.id = f.requesterId")
        .where("f.status = 'pending'")
        .andWhere("f.addresseeId = :userId", { userId })
        .andWhere("other.status = 'active'")
        .getCount(),
    ]);

    return successResponse(res, { data: { user: req.user, counts: { friends, pendingFriendRequests } } });
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

  // GET /users/:userId  - someone's profile, depending on how the viewer is connected to them.
  //   - Anyone logged in: id, username, displayName (enough to find someone and add them).
  //   - Friends, or viewing your own profile: also bio and counts.friends.
  //   - friendship.status tells the app which button to show:
  //       none -> Add friend, request_sent -> Cancel, request_received -> Accept / Decline,
  //       friends -> Unfriend, self -> no button.
  //     friendship.id is the id the Accept / Cancel / Decline endpoints need (null if no row).
  // Their memories are NOT returned here; they come from the memories endpoints, which
  // apply the visibility rules.
  // `select` limits the query itself to public columns, so private ones (email, status,
  // lastLoginAt...) are never loaded and can't leak if the response shape changes later.
  // Disabled and soft-deleted users get the same 404 as ids that never existed.
  getPublicProfile = async (req: Request, res: Response): Promise<Response> => {
    const viewerId = currentUserId(req);
    const { userId } = req.params as { userId: string };

    const user = await this.userModel.findOne({
      where: { id: userId, status: "active" },
      select: { id: true, username: true, displayName: true, bio: true },
    });
    if (!user) throw new NotFoundException("User not found");

    let friendship: { id: string | null; status: ProfileFriendshipStatus };
    if (userId === viewerId) {
      friendship = { id: null, status: "self" };
    } else {
      // At most one row per pair, in either direction.
      const row = await this.friendshipModel.findOne({
        where: [
          { requesterId: viewerId, addresseeId: userId },
          { requesterId: userId, addresseeId: viewerId },
        ],
      });
      friendship = { id: row?.id ?? null, status: this.friendshipStatusFor(row, viewerId) };
    }

    const isFriendOrSelf = friendship.status === "friends" || friendship.status === "self";
    if (!isFriendOrSelf) {
      const { id, username, displayName } = user;
      return successResponse(res, { data: { user: { id, username, displayName }, friendship } });
    }

    const friends = await this.countFriends(userId);
    return successResponse(res, { data: { user, friendship, counts: { friends } } });
  };

  /** Accepted friendships of `userId`, skipping friends who are disabled or soft-deleted. */
  private countFriends = (userId: string): Promise<number> =>
    this.friendshipModel.repo
      .createQueryBuilder("f")
      // The "other" user is whichever side of the row isn't userId.
      .innerJoin(User, "other", "other.id = CASE WHEN f.requesterId = :userId THEN f.addresseeId ELSE f.requesterId END")
      .where("f.status = 'accepted'")
      .andWhere("(f.requesterId = :userId OR f.addresseeId = :userId)", { userId })
      // Soft-deleted users are already excluded: TypeORM adds deleted_at IS NULL to the join.
      .andWhere("other.status = 'active'")
      .getCount();

  private friendshipStatusFor = (row: Friendship | null, viewerId: string): ProfileFriendshipStatus => {
    if (!row) return "none";
    if (row.status === "accepted") return "friends";
    return row.requesterId === viewerId ? "request_sent" : "request_received";
  };
}

type ProfileFriendshipStatus = "none" | "request_sent" | "request_received" | "friends" | "self";

export default new UserService();
