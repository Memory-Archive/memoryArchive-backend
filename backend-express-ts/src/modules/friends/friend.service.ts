import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { Friendship, User } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

/**
 * Friendships table rules (see friendship.model.ts):
 *  - one row per pair of users: status 'pending' (request) or 'accepted' (friends)
 *  - decline / cancel / unfriend DELETE the row
 *  - friends of X = 'accepted' rows where X is requester OR addressee
 *  - everywhere users are listed: skip users that are disabled or soft-deleted
 */
class FriendService {
  private readonly friendshipModel = new DBService(Friendship);
  private readonly userModel = new DBService(User);

  // GET /friends  - my friends (accepted), paginated, with the other user's
  // id, username, displayName (never email or other private fields).
  listFriends = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /friends/requests?direction=incoming|outgoing  - pending requests.
  // incoming: addressee = me (show the sender). outgoing: requester = me (show the receiver).
  listRequests = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /friends/requests  { userId }
  //  - 400 if userId is me; 404 if the user doesn't exist, is disabled or soft-deleted.
  //  - If THEY already sent ME a pending request: accept it instead (same as acceptRequest).
  //  - 409 if a row between us already exists (pending from me, or already friends).
  //    The unique key + trigger also return ER_DUP_ENTRY -> 409 if two requests race.
  //  - Insert { requesterId: me, addresseeId: userId, status: 'pending' }, return 201.
  //  - notify(userId, "friend.requested", { friendshipId, byUserId: me })
  sendRequest = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /friends/requests/:friendshipId/accept
  //  - Only the addressee can accept, and only while status = 'pending'. Otherwise 404.
  //  - Set status = 'accepted', respondedAt = now.
  //  - notify(requesterId, "friend.accepted", { friendshipId, byUserId: me })
  acceptRequest = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /friends/requests/:friendshipId
  //  - Addressee = decline, requester = cancel. Only while status = 'pending'. Otherwise 404.
  //  - Delete the row, and delete the matching "friend.requested" notification.
  removeRequest = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /friends/:userId  - unfriend. Delete the 'accepted' row between me and userId
  // (either direction). 404 if we aren't friends.
  unfriend = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new FriendService();
