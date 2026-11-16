import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import notificationService from "./notification.service";
import * as validators from "./notification.validation";

const router = Router();
router.use(authentication());

router.get("/", validation(validators.listNotifications), notificationService.list);
router.get("/unread-count", notificationService.unreadCount);
router.patch("/read-all", notificationService.markAllRead);
router.patch("/:notificationId/read", validation(validators.notificationIdParam), notificationService.markRead);
router.delete("/:notificationId", validation(validators.notificationIdParam), notificationService.remove);

export default router;
