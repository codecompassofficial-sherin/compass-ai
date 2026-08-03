import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authenticate } from "../auth/auth.middleware.js";
import { roadmapController } from "./roadmap.controller.js";

const router = Router();

router.post("/generate", authenticate, asyncHandler(roadmapController.generate));
router.post("/regenerate", authenticate, asyncHandler(roadmapController.regenerate));
router.get("/", authenticate, asyncHandler(roadmapController.getActive));
router.get("/history", authenticate, asyncHandler(roadmapController.getHistory));
router.get("/compare", authenticate, asyncHandler(roadmapController.compare));
router.get("/:id", authenticate, asyncHandler(roadmapController.getById));

export const roadmapRoutes = router;
