import { z } from "zod";
import { generalFields, paginationQuery } from "../../common/validation";

/** Without filters: the current user's own activity. With collectionId: the collection feed (members only). */
export const listActivity = {
  query: paginationQuery.extend({
    collectionId: generalFields.id.optional(),
    memoryId: generalFields.id.optional(),
  }),
};

export type ListActivityQuery = z.infer<typeof listActivity.query>;
