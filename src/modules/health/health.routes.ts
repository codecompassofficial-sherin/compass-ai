import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { healthController } from "./health.controller.js";

const router = Router();

router.get("/health", asyncHandler(healthController.getHealth));
router.get("/ready", asyncHandler(healthController.getReady));

export const healthRoutes = router;
