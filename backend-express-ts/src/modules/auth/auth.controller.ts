import { Router } from "express";
import { validation } from "../../middleware/validation.middleware";
import authService from "./auth.service";
import * as validators from "./auth.validation";

const router = Router();

router.post("/signup", validation(validators.signup), authService.signup);
router.post("/login", validation(validators.login), authService.login);
router.post("/refresh", validation(validators.refreshToken), authService.refresh);
router.post("/logout", validation(validators.refreshToken), authService.logout);
router.post("/forgot-password", validation(validators.forgotPassword), authService.forgotPassword);
router.post("/reset-password", validation(validators.resetPassword), authService.resetPassword);

export default router;
