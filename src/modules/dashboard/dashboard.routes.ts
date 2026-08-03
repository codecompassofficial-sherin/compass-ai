import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authenticate } from "../auth/auth.middleware.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

router.get("/", authenticate, asyncHandler(dashboardController.get));

export const dashboardRoutes = router;
