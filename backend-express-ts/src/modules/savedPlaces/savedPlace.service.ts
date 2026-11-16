import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { Place, SavedPlace } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

class SavedPlaceService {
  private readonly savedPlaceModel = new DBService(SavedPlace);
  private readonly placeModel = new DBService(Place);

  // GET /saved-places  - current user's saved places (with `place` relation), filter by status.
  list = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /saved-places  - 409 if already saved (saved_places_user_place_key).
  create = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /saved-places/:savedPlaceId
  getById = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /saved-places/:savedPlaceId
  update = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /saved-places/:savedPlaceId  (linked reminders cascade)
  remove = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new SavedPlaceService();
