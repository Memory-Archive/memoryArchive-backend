import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import tagService from "./tag.service";
import * as validators from "./tag.validation";

const router = Router();
router.use(authentication());

router.get("/", tagService.list);
router.post("/", validation(validators.createTag), tagService.create);
router.patch("/:tagId", validation(validators.updateTag), tagService.update);
router.delete("/:tagId", validation(validators.tagIdParam), tagService.remove);

export default router;
