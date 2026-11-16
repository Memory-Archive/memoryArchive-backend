import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { Collection, CollectionMember, CollectionMemory, MediaAsset, Memory } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

/**
 * Permissions:
 *  - owner (collections.user_id): everything
 *  - contributor: view + add/remove memories they added
 *  - viewer: view only
 */
class CollectionService {
  private readonly collectionModel = new DBService(Collection);
  private readonly memberModel = new DBService(CollectionMember);
  private readonly collectionMemoryModel = new DBService(CollectionMemory);
  private readonly memoryModel = new DBService(Memory);
  private readonly mediaModel = new DBService(MediaAsset);

  // GET /collections?scope=all|owned|shared
  list = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /collections
  create = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /collections/:collectionId  (owner or member)
  getById = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /collections/:collectionId  (owner only; coverMediaId must be media inside the collection)
  update = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /collections/:collectionId  - soft delete (owner only).
  remove = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /collections/:collectionId/memories
  listMemories = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /collections/:collectionId/memories  (owner/contributor; the memory must be theirs). Log activity.
  addMemory = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /collections/:collectionId/memories/:memoryId
  removeMemory = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /collections/:collectionId/members  - owner + members with user info.
  listMembers = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /collections/:collectionId/members/:userId  (owner only)
  updateMemberRole = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /collections/:collectionId/members/:userId  - owner removes a member, or a member leaves.
  removeMember = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new CollectionService();
