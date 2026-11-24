import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { Comment, Memory } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

class CommentService {
  private readonly commentModel = new DBService(Comment);
  private readonly memoryModel = new DBService(Memory);

  // PRIVACY: every endpoint here first runs the shared memory read check (see the top of
  // memory.service.ts): owner, OR friend of the owner when visibility = 'friends', OR
  // member of a collection containing the memory. Fail -> 404, not 403.
  // If the owner later switches the memory to 'private' or unfriends someone, that person
  // loses access to the comments too (the check runs on every request, nothing is cached).
  // Comments are kept in the DB; they just become unreachable for that user.

  // GET /memories/:memoryId/comments  - oldest first, include author (id, username, displayName).
  list = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /memories/:memoryId/comments  - needs read access to the memory; notify the memory owner.
  create = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /memories/:memoryId/comments/:commentId  (author only)
  update = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /memories/:memoryId/comments/:commentId  - soft delete (author or memory owner).
  remove = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new CommentService();
