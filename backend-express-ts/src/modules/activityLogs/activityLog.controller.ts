import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import activityLogService from "./activityLog.service";
import * as validators from "./activityLog.validation";

const router = Router();
router.use(authentication());

router.get("/", validation(validators.listActivity), activityLogService.list);

export default router;
