import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { CollectionMember, CollectionMemory, Memory, Place, Tag } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

/**
 * Access rule to implement once (and reuse in media/comments/reactions):
 * a user can read a memory if they own it OR it belongs to a collection they own
 * or are a member of. Only the owner can edit/delete it.
 */
class MemoryService {
  private readonly memoryModel = new DBService(Memory);
  private readonly placeModel = new DBService(Place);
  private readonly tagModel = new DBService(Tag);
  private readonly collectionMemoryModel = new DBService(CollectionMemory);
  private readonly collectionMemberModel = new DBService(CollectionMember);

  // GET /memories  - current user's memories with filters + pagination.
  // Full-text: MATCH(title, description) AGAINST (:q IN NATURAL LANGUAGE MODE) via query builder.
  list = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /memories  - validate placeId exists and tagIds belong to the user; create in a transaction.
  create = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /memories/:memoryId  - with place, tags, cover/media.
  getById = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /memories/:memoryId  (owner only)
  update = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /memories/:memoryId  - soft delete (owner only).
  remove = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PUT /memories/:memoryId/tags  - replace the memory's tag set (tags must belong to the user).
  setTags = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new MemoryService();
