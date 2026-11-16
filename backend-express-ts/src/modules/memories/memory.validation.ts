import { z } from "zod";
import { generalFields, idParams, paginationQuery } from "../../common/validation";

const memoryFields = {
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).nullish(),
  memoryDate: generalFields.date,
  memoryTime: generalFields.time.nullish(),
  timezone: z.string().trim().max(64).nullish(),
  placeId: generalFields.id.nullish(),
  spotifyTrackUri: z.string().trim().max(255).nullish(),
  spotifyTrackName: z.string().trim().max(255).nullish(),
};

export const listMemories = {
  query: paginationQuery.extend({
    from: generalFields.date.optional(),
    to: generalFields.date.optional(),
    placeId: generalFields.id.optional(),
    tagId: generalFields.id.optional(),
    /** Full-text search over title + description (memories_search_idx). */
    q: z.string().trim().min(1).max(200).optional(),
    sort: z.enum(["newest", "oldest"]).default("newest"),
  }),
};

export const createMemory = {
  body: z.object({
    ...memoryFields,
    tagIds: z.array(generalFields.id).max(50).optional(),
  }),
};

export const updateMemory = {
  params: idParams("memoryId"),
  body: z
    .object(memoryFields)
    .partial()
    .refine((b) => Object.keys(b).length > 0, "Provide at least one field to update"),
};

export const setMemoryTags = {
  params: idParams("memoryId"),
  body: z.object({ tagIds: z.array(generalFields.id).max(50) }),
};

export const memoryIdParam = { params: idParams("memoryId") };

export type ListMemoriesQuery = z.infer<typeof listMemories.query>;
export type CreateMemoryDTO = z.infer<typeof createMemory.body>;
export type UpdateMemoryDTO = z.infer<typeof updateMemory.body>;
export type SetMemoryTagsDTO = z.infer<typeof setMemoryTags.body>;
