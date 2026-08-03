import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { validateBody } from "../../middleware/validate.js";
import { authenticate } from "../auth/auth.middleware.js";
import { projectsController } from "./projects.controller.js";
import { createProjectSchema, updateProjectSchema } from "./projects.validation.js";

const router = Router();

router.get("/", authenticate, asyncHandler(projectsController.list));
router.post(
  "/",
  authenticate,
  validateBody(createProjectSchema),
  asyncHandler(projectsController.create),
);
router.get("/:id", authenticate, asyncHandler(projectsController.getById));
router.patch(
  "/:id",
  authenticate,
  validateBody(updateProjectSchema),
  asyncHandler(projectsController.update),
);
router.post("/:id/complete", authenticate, asyncHandler(projectsController.complete));
router.delete("/:id", authenticate, asyncHandler(projectsController.archive));

export const projectsRoutes = router;
