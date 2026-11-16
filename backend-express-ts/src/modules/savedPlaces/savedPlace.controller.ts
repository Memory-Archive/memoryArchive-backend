import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import savedPlaceService from "./savedPlace.service";
import * as validators from "./savedPlace.validation";

const router = Router();
router.use(authentication());

router.get("/", validation(validators.listSavedPlaces), savedPlaceService.list);
router.post("/", validation(validators.createSavedPlace), savedPlaceService.create);
router.get("/:savedPlaceId", validation(validators.savedPlaceIdParam), savedPlaceService.getById);
router.patch("/:savedPlaceId", validation(validators.updateSavedPlace), savedPlaceService.update);
router.delete("/:savedPlaceId", validation(validators.savedPlaceIdParam), savedPlaceService.remove);

export default router;
