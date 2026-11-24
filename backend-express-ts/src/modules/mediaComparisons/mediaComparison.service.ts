import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { MediaAsset, MediaComparison } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

class MediaComparisonService {
  private readonly comparisonModel = new DBService(MediaComparison);
  private readonly mediaModel = new DBService(MediaAsset);

  // GET /media-comparisons  - with leftMediaAsset + rightMediaAsset relations.
  list = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /media-comparisons  - both media must exist, be photos, and be accessible to the user.
  // "Accessible" = passes the shared memory read check, which now includes friends'
  // 'friends' memories. Decide: allow comparing with a friend's photo, or own photos only?
  // If friends' photos are allowed, a later unfriend/private switch must hide that side
  // when the comparison is read (re-check access on GET, don't trust the stored row).
  // Comparisons themselves are private to their creator.
  create = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // GET /media-comparisons/:comparisonId
  getById = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /media-comparisons/:comparisonId
  update = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /media-comparisons/:comparisonId
  remove = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new MediaComparisonService();
