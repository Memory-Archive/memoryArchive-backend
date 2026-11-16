import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import placeService from "./place.service";
import * as validators from "./place.validation";

const router = Router();
router.use(authentication());

router.get("/", validation(validators.searchPlaces), placeService.search);
router.post("/", validation(validators.createPlace), placeService.create);
router.get("/:placeId", validation(validators.placeIdParam), placeService.getById);

export default router;
