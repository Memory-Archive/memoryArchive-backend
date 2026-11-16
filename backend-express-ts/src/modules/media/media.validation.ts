import { z } from "zod";
import { MEDIA_TYPES } from "../../common/enums";
import { generalFields, idParams } from "../../common/validation";

/**
 * Upload metadata. If you upload through the API (e.g. multer), most of these
 * fields come from the file itself and only caption/sortOrder/isCover come from the body.
 * If clients upload directly to storage (presigned URL), they send this after the upload.
 */
export const createMedia = {
  params: idParams("memoryId"),
  body: z.object({
    storageKey: z.string().trim().min(1).max(255),
    originalFilename: z.string().trim().max(255).nullish(),
    mediaType: z.enum(MEDIA_TYPES),
    mimeType: z.string().trim().min(1).max(100),
    fileSizeBytes: z.number().int().positive(),
    widthPx: z.number().int().positive().nullish(),
    heightPx: z.number().int().positive().nullish(),
    durationSeconds: z.number().min(0).max(999999.99).nullish(),
    checksumSha256: z.string().regex(/^[a-f0-9]{64}$/i).nullish(),
    caption: z.string().trim().max(500).nullish(),
    sortOrder: z.number().int().default(0),
    isCover: z.boolean().default(false),
  }),
};

export const reorderMedia = {
  params: idParams("memoryId"),
  body: z.object({ mediaIds: z.array(generalFields.id).min(1) }),
};

export const updateMedia = {
  params: idParams("mediaId"),
  body: z
    .object({
      caption: z.string().trim().max(500).nullable(),
      sortOrder: z.number().int(),
    })
    .partial()
    .refine((b) => Object.keys(b).length > 0, "Provide at least one field to update"),
};

export const memoryIdParam = { params: idParams("memoryId") };
export const mediaIdParam = { params: idParams("mediaId") };

export type CreateMediaDTO = z.infer<typeof createMedia.body>;
export type ReorderMediaDTO = z.infer<typeof reorderMedia.body>;
export type UpdateMediaDTO = z.infer<typeof updateMedia.body>;
