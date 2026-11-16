import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import { memoryMediaRouter } from "../media/media.controller";
import commentRouter from "../comments/comment.controller";
import reactionRouter from "../reactions/reaction.controller";
import memoryService from "./memory.service";
import * as validators from "./memory.validation";

const router = Router();
router.use(authentication());

router.get("/", validation(validators.listMemories), memoryService.list);
router.post("/", validation(validators.createMemory), memoryService.create);
router.get("/:memoryId", validation(validators.memoryIdParam), memoryService.getById);
router.patch("/:memoryId", validation(validators.updateMemory), memoryService.update);
router.delete("/:memoryId", validation(validators.memoryIdParam), memoryService.remove);
router.put("/:memoryId/tags", validation(validators.setMemoryTags), memoryService.setTags);

// Nested resources (their routers use mergeParams to read :memoryId)
router.use("/:memoryId/media", memoryMediaRouter);
router.use("/:memoryId/comments", commentRouter);
router.use("/:memoryId/reactions", reactionRouter);

export default router;
