import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody } from "../../middleware/validate.js";
import { authenticate } from "../auth/auth.middleware.js";
import { profileController } from "./profile.controller.js";
import { updateProfileSchema } from "./profile.validation.js";

const router = Router();

router.get("/", authenticate, asyncHandler(profileController.getProfile));
router.patch(
  "/",
  authenticate,
  validateBody(updateProfileSchema),
  asyncHandler(profileController.updateProfile),
);

export const profileRoutes = router;
