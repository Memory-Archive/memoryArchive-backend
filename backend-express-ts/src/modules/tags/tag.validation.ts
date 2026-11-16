import { z } from "zod";
import { generalFields, idParams } from "../../common/validation";

const tagBody = z.object({
  name: z.string().trim().min(1).max(50),
  color: generalFields.hexColor.nullish(),
});

export const createTag = { body: tagBody };

export const updateTag = {
  params: idParams("tagId"),
  body: tagBody.partial().refine((b) => Object.keys(b).length > 0, "Provide at least one field to update"),
};

export const tagIdParam = { params: idParams("tagId") };

export type CreateTagDTO = z.infer<typeof createTag.body>;
export type UpdateTagDTO = z.infer<typeof updateTag.body>;
