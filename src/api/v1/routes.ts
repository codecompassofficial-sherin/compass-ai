import { Router } from "express";
import { assessmentRoutes } from "../../modules/assessment/assessment.routes.js";
import { authRoutes } from "../../modules/auth/auth.routes.js";
import { goalsRoutes } from "../../modules/goals/goals.routes.js";
import { healthRoutes } from "../../modules/health/health.routes.js";
import { profileRoutes } from "../../modules/profile/profile.routes.js";
import { projectsRoutes } from "../../modules/projects/projects.routes.js";
import { roadmapRoutes } from "../../modules/roadmap/roadmap.routes.js";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/assessment", assessmentRoutes);
router.use("/roadmap", roadmapRoutes);
router.use("/goals", goalsRoutes);
router.use("/projects", projectsRoutes);

export const v1Routes = router;
