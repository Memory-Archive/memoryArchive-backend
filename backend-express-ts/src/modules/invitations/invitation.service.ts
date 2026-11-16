import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { Collection, CollectionInvitation, CollectionMember, User } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

class InvitationService {
  private readonly invitationModel = new DBService(CollectionInvitation);
  private readonly collectionModel = new DBService(Collection);
  private readonly memberModel = new DBService(CollectionMember);
  private readonly userModel = new DBService(User);

  // ---- Owner side: /collections/:collectionId/invitations ----

  // GET  - all invitations for the collection (owner only).
  listForCollection = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST - generate a random token (store only its hash), expiresAt = now + N days,
  // 409 if a pending invite for this email exists (collection_invitations_pending_key)
  // or the user is already a member. Notify the invitee / send email.
  create = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /:invitationId - set status "revoked" (pending only).
  revoke = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // ---- Invitee side: /invitations ----

  // GET /invitations - pending, unexpired invitations for my user id or my email.
  listMine = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /invitations/accept - by token (from an email link). In a transaction:
  // mark accepted + respondedAt, insert CollectionMember with the invite's role.
  accept = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /invitations/:invitationId/decline
  decline = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new InvitationService();
