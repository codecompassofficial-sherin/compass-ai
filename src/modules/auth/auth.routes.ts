import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody } from "../../middleware/validate.js";
import { authController } from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/register", validateBody(registerSchema), asyncHandler(authController.register));
router.post("/login", validateBody(loginSchema), asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));
router.post("/logout", asyncHandler(authController.logout));
router.post("/logout-all", authenticate, asyncHandler(authController.logoutAll));
router.get("/me", authenticate, asyncHandler(authController.getMe));
router.post(
  "/verify-email",
  validateBody(verifyEmailSchema),
  asyncHandler(authController.verifyEmail),
);
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword),
);
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  asyncHandler(authController.resetPassword),
);

export const authRoutes = router;
