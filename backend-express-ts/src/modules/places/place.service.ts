import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { Place } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

class PlaceService {
  private readonly placeModel = new DBService(Place);

  // GET /places?q=&lat=&lng=&radiusKm=
  // Name search and/or nearby search. For nearby: bounding-box filter on
  // places_lat_lng_idx, then haversine distance to sort/trim.
  search = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /places/:placeId
  getById = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /places  - find existing by (provider, providerPlaceId) or create.
  create = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new PlaceService();
