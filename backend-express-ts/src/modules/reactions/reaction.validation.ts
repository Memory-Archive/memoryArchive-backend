import { z } from "zod";
import { REACTION_TYPES } from "../../common/enums";
import { idParams } from "../../common/validation";

export const memoryIdParam = { params: idParams("memoryId") };

export const setReaction = {
  params: idParams("memoryId"),
  body: z.object({ reactionType: z.enum(REACTION_TYPES) }),
};

export type SetReactionDTO = z.infer<typeof setReaction.body>;
