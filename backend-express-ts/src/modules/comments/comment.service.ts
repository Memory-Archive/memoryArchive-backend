import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { Comment, Memory } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

class CommentService {
  private readonly commentModel = new DBService(Comment);
  private readonly memoryModel = new DBService(Memory);

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
