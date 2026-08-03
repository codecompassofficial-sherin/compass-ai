import { Router } from "express";
import { authRoutes } from "../../modules/auth/auth.routes.js";
import { healthRoutes } from "../../modules/health/health.routes.js";
import { profileRoutes } from "../../modules/profile/profile.routes.js";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);

export const v1Routes = router;
