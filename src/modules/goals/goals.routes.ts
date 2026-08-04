import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody } from "../../middleware/validate.js";
import { authenticate } from "../auth/auth.middleware.js";
import { goalsController } from "./goals.controller.js";
import { updateTaskStatusSchema } from "./goals.validation.js";

const router = Router();

router.get("/", authenticate, asyncHandler(goalsController.list));
router.get("/:id", authenticate, asyncHandler(goalsController.getById));
router.post("/:id/activate", authenticate, asyncHandler(goalsController.activate));
router.post("/:id/complete", authenticate, asyncHandler(goalsController.complete));
router.patch(
  "/:goalId/tasks/:taskId",
  authenticate,
  validateBody(updateTaskStatusSchema),
  asyncHandler(goalsController.updateTask),
);

export const goalsRoutes = router;
