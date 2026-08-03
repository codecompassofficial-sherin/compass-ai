import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authenticate } from "../auth/auth.middleware.js";
import { intelligenceController } from "./intelligence.controller.js";

const router = Router();

router.get("/", authenticate, asyncHandler(intelligenceController.get));

export const intelligenceRoutes = router;
