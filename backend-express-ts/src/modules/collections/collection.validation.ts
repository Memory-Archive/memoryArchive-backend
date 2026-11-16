import { z } from "zod";
import { COLLECTION_ROLES } from "../../common/enums";
import { generalFields, idParams, paginationQuery } from "../../common/validation";

const collectionFields = {
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).nullish(),
  coverMediaId: generalFields.id.nullish(),
};

export const listCollections = {
  query: paginationQuery.extend({
    scope: z.enum(["all", "owned", "shared"]).default("all"),
  }),
};

export const createCollection = { body: z.object(collectionFields) };

export const updateCollection = {
  params: idParams("collectionId"),
  body: z
    .object(collectionFields)
    .partial()
    .refine((b) => Object.keys(b).length > 0, "Provide at least one field to update"),
};

export const collectionIdParam = { params: idParams("collectionId") };

export const listCollectionMemories = {
  params: idParams("collectionId"),
  query: paginationQuery,
};

export const addCollectionMemory = {
  params: idParams("collectionId"),
  body: z.object({ memoryId: generalFields.id }),
};

export const collectionMemoryParams = { params: idParams("collectionId", "memoryId") };

export const updateMemberRole = {
  params: idParams("collectionId", "userId"),
  body: z.object({ role: z.enum(COLLECTION_ROLES) }),
};

export const memberParams = { params: idParams("collectionId", "userId") };

export type ListCollectionsQuery = z.infer<typeof listCollections.query>;
export type CreateCollectionDTO = z.infer<typeof createCollection.body>;
export type UpdateCollectionDTO = z.infer<typeof updateCollection.body>;
export type AddCollectionMemoryDTO = z.infer<typeof addCollectionMemory.body>;
export type UpdateMemberRoleDTO = z.infer<typeof updateMemberRole.body>;
