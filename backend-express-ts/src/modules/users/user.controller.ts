import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware";
import { validation } from "../../middleware/validation.middleware";
import userService from "./user.service";
import * as validators from "./user.validation";

const router = Router();
router.use(authentication());

router.get("/me", userService.getMe);
router.patch("/me", validation(validators.updateProfile), userService.updateMe);
router.patch("/me/password", validation(validators.changePassword), userService.changePassword);
router.delete("/me", userService.deleteMe);
router.get("/me/sessions", userService.listSessions);
router.delete("/me/sessions/:sessionId", validation(validators.sessionIdParam), userService.revokeSession);
router.get("/:userId", validation(validators.userIdParam), userService.getPublicProfile);

export default router;
