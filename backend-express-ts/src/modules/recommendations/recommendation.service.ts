import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { Memory, RecommendationFeedback, SavedPlace } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

class RecommendationService {
  private readonly feedbackModel = new DBService(RecommendationFeedback);
  private readonly memoryModel = new DBService(Memory);
  private readonly savedPlaceModel = new DBService(SavedPlace);

  // GET /recommendations?lat=&lng=  - query a places provider; down-rank places with low
  // feedback ratings and places already visited / saved.
  list = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /recommendations/feedback
  createFeedback = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /recommendations/feedback  - the current user's feedback history.
  listFeedback = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new RecommendationService();
