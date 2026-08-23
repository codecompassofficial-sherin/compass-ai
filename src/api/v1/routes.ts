import { Router } from "express";
import { apiRateLimiter, authRateLimiter } from "../../middleware/rateLimit.js";
import { assessmentRoutes } from "../../modules/assessment/assessment.routes.js";
import { authRoutes } from "../../modules/auth/auth.routes.js";
import { dashboardRoutes } from "../../modules/dashboard/dashboard.routes.js";
import { goalsRoutes } from "../../modules/goals/goals.routes.js";
import { healthRoutes } from "../../modules/health/health.routes.js";
import { intelligenceRoutes } from "../../modules/intelligence/intelligence.routes.js";
import { jobRoutes } from "../../modules/jobs/job.routes.js";
import { profileRoutes } from "../../modules/profile/profile.routes.js";
import { projectsRoutes } from "../../modules/projects/projects.routes.js";
import { roadmapRoutes } from "../../modules/roadmap/roadmap.routes.js";

const router = Router();

router.use("/", healthRoutes);
router.use(apiRateLimiter);
router.use("/auth", authRateLimiter, authRoutes);
router.use("/profile", profileRoutes);
router.use("/assessment", assessmentRoutes);
router.use("/roadmap", roadmapRoutes);
router.use("/goals", goalsRoutes);
router.use("/projects", projectsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/intelligence", intelligenceRoutes);
router.use("/jobs", jobRoutes);

export const v1Routes = router;
