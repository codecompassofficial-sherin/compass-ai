import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authenticate } from "../auth/auth.middleware.js";
import { jobController } from "./job.controller.js";

const router = Router();

router.get("/health", authenticate, asyncHandler(jobController.health));

export const jobRoutes = router;
