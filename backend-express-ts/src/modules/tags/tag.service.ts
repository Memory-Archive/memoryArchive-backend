import type { Request, Response } from "express";
import { DBService } from "../../DB/db.service";
import { Tag } from "../../DB/models";
import { currentUserId } from "../../middleware/authentication.middleware";
import { NotFoundException } from "../../utils/errors/app.error";
import { successResponse } from "../../utils/response/success.response";
import type { CreateTagDTO, UpdateTagDTO } from "./tag.validation";

/**
 * Fully implemented reference module: copy this pattern for the others.
 * Duplicate names per user hit the `tags_user_name_key` unique index and are
 * turned into a 409 by the global error handler.
 */
class TagService {
  private readonly tagModel = new DBService(Tag);

  // GET /tags
  list = async (req: Request, res: Response): Promise<Response> => {
    const tags = await this.tagModel.find({
      where: { userId: currentUserId(req) },
      order: { name: "ASC" },
    });
    return successResponse(res, { data: { tags } });
  };

  // POST /tags
  create = async (req: Request, res: Response): Promise<Response> => {
    const { name, color } = req.body as CreateTagDTO;
    const tag = await this.tagModel.create({ userId: currentUserId(req), name, color: color ?? null });
    return successResponse(res, { status: 201, message: "Tag created", data: { tag } });
  };

  // PATCH /tags/:tagId
  update = async (req: Request, res: Response): Promise<Response> => {
    const { tagId } = req.params as { tagId: string };
    const where = { id: tagId, userId: currentUserId(req) };

    const affected = await this.tagModel.update(where, req.body as UpdateTagDTO);
    if (!affected) throw new NotFoundException("Tag not found");

    const tag = await this.tagModel.findOneBy(where);
    return successResponse(res, { message: "Tag updated", data: { tag } });
  };

  // DELETE /tags/:tagId  (memory_tags rows cascade)
  remove = async (req: Request, res: Response): Promise<Response> => {
    const { tagId } = req.params as { tagId: string };
    const affected = await this.tagModel.delete({ id: tagId, userId: currentUserId(req) });
    if (!affected) throw new NotFoundException("Tag not found");
    return successResponse(res, { message: "Tag deleted" });
  };
}

export default new TagService();
