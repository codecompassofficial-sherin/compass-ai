import { Router } from "express";
import { authRoutes } from "../../modules/auth/auth.routes.js";
import { healthRoutes } from "../../modules/health/health.routes.js";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);

export const v1Routes = router;
