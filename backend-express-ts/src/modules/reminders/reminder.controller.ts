import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import reminderService from "./reminder.service";
import * as validators from "./reminder.validation";

const router = Router();
router.use(authentication());

router.get("/", validation(validators.listReminders), reminderService.list);
router.post("/", validation(validators.createReminder), reminderService.create);
router.get("/:reminderId", validation(validators.reminderIdParam), reminderService.getById);
router.patch("/:reminderId", validation(validators.updateReminder), reminderService.update);
router.delete("/:reminderId", validation(validators.reminderIdParam), reminderService.remove);

export default router;
