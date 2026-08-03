import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody } from "../../middleware/validate.js";
import { authenticate } from "../auth/auth.middleware.js";
import { assessmentController } from "./assessment.controller.js";
import { createAssessmentSchema, updateAssessmentSchema } from "./assessment.validation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  validateBody(createAssessmentSchema),
  asyncHandler(assessmentController.create),
);
router.get("/", authenticate, asyncHandler(assessmentController.get));
router.patch(
  "/",
  authenticate,
  validateBody(updateAssessmentSchema),
  asyncHandler(assessmentController.update),
);

export const assessmentRoutes = router;
