import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import recommendationService from "./recommendation.service";
import * as validators from "./recommendation.validation";

const router = Router();
router.use(authentication());

router.get("/", validation(validators.getRecommendations), recommendationService.list);
router.get("/feedback", validation(validators.listFeedback), recommendationService.listFeedback);
router.post("/feedback", validation(validators.createFeedback), recommendationService.createFeedback);

export default router;
