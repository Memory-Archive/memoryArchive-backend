import { Router } from "express";
import { validation } from "../../middleware/validation.middleware";
import reactionService from "./reaction.service";
import * as validators from "./reaction.validation";

/** Mounted at /memories/:memoryId/reactions (authentication applied by the parent router). */
const router = Router({ mergeParams: true });

router.get("/", validation(validators.memoryIdParam), reactionService.list);
router.put("/", validation(validators.setReaction), reactionService.set);
router.delete("/", validation(validators.memoryIdParam), reactionService.remove);

export default router;
