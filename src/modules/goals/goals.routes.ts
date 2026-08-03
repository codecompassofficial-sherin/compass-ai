import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authenticate } from "../auth/auth.middleware.js";
import { goalsController } from "./goals.controller.js";

const router = Router();

router.get("/", authenticate, asyncHandler(goalsController.list));
router.get("/:id", authenticate, asyncHandler(goalsController.getById));
router.post("/:id/activate", authenticate, asyncHandler(goalsController.activate));
router.post("/:id/complete", authenticate, asyncHandler(goalsController.complete));

export const goalsRoutes = router;
