import { rateLimit } from "express-rate-limit";
import { env } from "../config/env.js";

const skipInTests = (): boolean => env.nodeEnv === "test";

export const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipInTests,
});

export const authRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.authRateLimitMax,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: skipInTests,
});
