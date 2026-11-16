import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import mediaService from "./media.service";
import * as validators from "./media.validation";

/** Mounted at /memories/:memoryId/media */
export const memoryMediaRouter = Router({ mergeParams: true });
memoryMediaRouter.get("/", validation(validators.memoryIdParam), mediaService.listForMemory);
memoryMediaRouter.post("/", validation(validators.createMedia), mediaService.create);
memoryMediaRouter.patch("/order", validation(validators.reorderMedia), mediaService.reorder);

/** Mounted at /media */
const router = Router();
router.use(authentication());

router.patch("/:mediaId", validation(validators.updateMedia), mediaService.update);
router.put("/:mediaId/cover", validation(validators.mediaIdParam), mediaService.setCover);
router.delete("/:mediaId", validation(validators.mediaIdParam), mediaService.remove);

export default router;
