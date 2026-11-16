import { Router } from "express";
import { validation } from "../../middleware/validation.middleware";
import commentService from "./comment.service";
import * as validators from "./comment.validation";

/** Mounted at /memories/:memoryId/comments (authentication applied by the parent router). */
const router = Router({ mergeParams: true });

router.get("/", validation(validators.listComments), commentService.list);
router.post("/", validation(validators.createComment), commentService.create);
router.patch("/:commentId", validation(validators.updateComment), commentService.update);
router.delete("/:commentId", validation(validators.commentIdParams), commentService.remove);

export default router;
