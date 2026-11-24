import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { MediaAsset, Memory } from "../../DB/models";
import { NotImplementedException } from "../../utils/errors/app.error";

class MediaService {
  private readonly mediaModel = new DBService(MediaAsset);
  private readonly memoryModel = new DBService(Memory);

  // PRIVACY: reading media uses the shared memory read check (owner / friend when
  // visibility = 'friends' / collection member). Changing media is owner only.
  // Files in storage must not be publicly reachable: serve them through short-lived
  // signed URLs generated AFTER the read check, or a private memory's photos leak.

  // GET /memories/:memoryId/media  - ordered by sortOrder (needs read access to the memory).
  listForMemory = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // POST /memories/:memoryId/media  (memory owner only)
  // If isCover: in a transaction, unset the current cover first (unique live_cover index).
  create = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /memories/:memoryId/media/order  - set sortOrder from the array position.
  reorder = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PATCH /media/:mediaId  (owner only)
  update = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // PUT /media/:mediaId/cover  - make this the memory's cover (unset the old one in the same transaction).
  setCover = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };

  // DELETE /media/:mediaId  - soft delete; also delete the file from storage (or queue it).
  remove = async (req: Request, res: Response): Promise<Response> => {
    throw new NotImplementedException();
  };
}

export default new MediaService();
