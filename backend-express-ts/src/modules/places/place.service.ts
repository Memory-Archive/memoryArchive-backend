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
  // Places are shared reference data, so anyone logged in can read one. If this ever
  // returns memories or saved info for the place, include ONLY the caller's own
  // (plus their own saved_places.isFavourite). Never other users' or friends' data here.
  getById = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /places  - find existing by (provider, providerPlaceId) or create.
  create = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new PlaceService();
