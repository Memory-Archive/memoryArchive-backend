import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import mediaComparisonService from "./mediaComparison.service";
import * as validators from "./mediaComparison.validation";

const router = Router();
router.use(authentication());

router.get("/", validation(validators.listComparisons), mediaComparisonService.list);
router.post("/", validation(validators.createComparison), mediaComparisonService.create);
router.get("/:comparisonId", validation(validators.comparisonIdParam), mediaComparisonService.getById);
router.patch("/:comparisonId", validation(validators.updateComparison), mediaComparisonService.update);
router.delete("/:comparisonId", validation(validators.comparisonIdParam), mediaComparisonService.remove);

export default router;
