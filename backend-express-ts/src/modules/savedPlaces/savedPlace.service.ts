import type { Request, Response } from "express";
import type { FindOptionsWhere } from "typeorm";
import { DBService } from "../../DB/db.service";
import { Place, SavedPlace } from "../../DB/models";
import { currentUserId } from "../../middleware/authentication.middleware";
import { ConflictException, NotFoundException } from "../../utils/errors/app.error";
import { successResponse } from "../../utils/response/success.response";
import type { CreateSavedPlaceDTO, ListSavedPlacesQuery, UpdateSavedPlaceDTO } from "./savedPlace.validation";

/**
 * Saved places are always private to their owner; friends never see them.
 * Every query below is scoped by the caller's userId, so another user's saved place
 * gets the same 404 as an id that never existed (no 403, which would confirm it exists).
 */
class SavedPlaceService {
  private readonly savedPlaceModel = new DBService(SavedPlace);
  private readonly placeModel = new DBService(Place);

  // GET /saved-places
  // Current user's saved places with the `place` relation, newest first.
  // Optional filters: status (planned / visited) and favourite=true|false.
  list = async (req: Request, res: Response): Promise<Response> => {
    const userId = currentUserId(req);
    const { page, limit, status, favourite } = req.query as unknown as ListSavedPlacesQuery;

    const where: FindOptionsWhere<SavedPlace> = { userId };
    if (status) where.status = status;
    if (favourite !== undefined) where.isFavourite = favourite;

    const result = await this.savedPlaceModel.paginate(
      { where, relations: { place: true }, order: { createdAt: "DESC", id: "ASC" } },
      { page, limit },
    );

    return successResponse(res, { data: result });
  };

  // POST /saved-places
  // 404 if the place doesn't exist, friendly 409 if the user already saved it.
  // The saved_places_user_place_key unique index still guards races; ER_DUP_ENTRY becomes a 409 globally.
  create = async (req: Request, res: Response): Promise<Response> => {
    const userId = currentUserId(req);
    const { placeId, notes, targetDate, status, isFavourite } = req.body as CreateSavedPlaceDTO;

    const placeExists = await this.placeModel.exists({ id: placeId });
    if (!placeExists) throw new NotFoundException("Place not found");

    const alreadySaved = await this.savedPlaceModel.exists({ userId, placeId });
    if (alreadySaved) throw new ConflictException("Place is already saved");

    const { id } = await this.savedPlaceModel.create({
      userId,
      placeId,
      notes: notes ?? null,
      targetDate: targetDate ?? null,
      status,
      isFavourite,
    });

    // Re-read so the response has the `place` relation and the stored defaults.
    const savedPlace = await this.findOwned(id, userId);
    return successResponse(res, { status: 201, message: "Place saved", data: { savedPlace } });
  };

  // GET /saved-places/:savedPlaceId
  getById = async (req: Request, res: Response): Promise<Response> => {
    const { savedPlaceId } = req.params as { savedPlaceId: string };

    const savedPlace = await this.findOwned(savedPlaceId, currentUserId(req));
    if (!savedPlace) throw new NotFoundException("Saved place not found");

    return successResponse(res, { data: { savedPlace } });
  };

  // PATCH /saved-places/:savedPlaceId
  // Partial update of notes / targetDate / status / isFavourite. placeId can't change here:
  // the validation schema strips it, so moving a saved place means delete + create.
  // Sending null for notes or targetDate clears it; omitting a field leaves it unchanged.
  update = async (req: Request, res: Response): Promise<Response> => {
    const userId = currentUserId(req);
    const { savedPlaceId } = req.params as { savedPlaceId: string };
    const changes = req.body as UpdateSavedPlaceDTO;

    const affected = await this.savedPlaceModel.update({ id: savedPlaceId, userId }, changes);
    if (affected === 0) throw new NotFoundException("Saved place not found");

    // Re-read so the response has the stored values, including the new updatedAt.
    const savedPlace = await this.findOwned(savedPlaceId, userId);
    return successResponse(res, { message: "Saved place updated", data: { savedPlace } });
  };

  // DELETE /saved-places/:savedPlaceId
  // Linked reminders are removed by the DB (reminders_saved_place_fk ON DELETE CASCADE).
  remove = async (req: Request, res: Response): Promise<Response> => {
    const { savedPlaceId } = req.params as { savedPlaceId: string };

    const deleted = await this.savedPlaceModel.delete({ id: savedPlaceId, userId: currentUserId(req) });
    if (deleted === 0) throw new NotFoundException("Saved place not found");

    return successResponse(res, { message: "Saved place removed" });
  };

  /** One of the caller's saved places with its `place`, or null if it isn't theirs. */
  private findOwned = (id: string, userId: string) =>
    this.savedPlaceModel.findOne({ where: { id, userId }, relations: { place: true } });
}

export default new SavedPlaceService();
