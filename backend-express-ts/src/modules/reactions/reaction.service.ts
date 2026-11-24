import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { Memory, Reaction } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

class ReactionService {
  private readonly reactionModel = new DBService(Reaction);
  private readonly memoryModel = new DBService(Memory);

  // PRIVACY: same shared memory read check as comments (owner / friend + 'friends' /
  // collection member), 404 otherwise. Friends can react to memories they can see.
  // Reactions are public to whoever can see the memory; favourites are NOT (owner-only
  // `memories.is_favourite`, never expose it here).

  // GET /memories/:memoryId/reactions  - counts per type + the current user's reaction.
  list = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PUT /memories/:memoryId/reactions  - upsert (repo.upsert on [memoryId, userId]).
  set = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /memories/:memoryId/reactions  - remove the current user's reaction.
  remove = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new ReactionService();
