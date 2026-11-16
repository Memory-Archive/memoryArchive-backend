import { z } from "zod";
import { idParams, paginationQuery } from "../../common/validation";

const body = z.string().trim().min(1).max(2000);

export const listComments = {
  params: idParams("memoryId"),
  query: paginationQuery,
};

export const createComment = {
  params: idParams("memoryId"),
  body: z.object({ body }),
};

export const updateComment = {
  params: idParams("memoryId", "commentId"),
  body: z.object({ body }),
};

export const commentIdParams = { params: idParams("memoryId", "commentId") };

export type CreateCommentDTO = z.infer<typeof createComment.body>;
export type UpdateCommentDTO = z.infer<typeof updateComment.body>;
