import "dotenv/config";
import { z } from "zod";

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  MONGODB_URI: z.url("MONGODB_URI must be a valid connection string"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().max(365).default(30),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  FRONTEND_URL: z
    .url("FRONTEND_URL must be a valid URL")
    .default("http://localhost:3000"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(600),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(50),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().max(65535).optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().min(1).optional(),
});

const envSchema = rawEnvSchema.transform((raw) => ({
  nodeEnv: raw.NODE_ENV,
  host: raw.HOST,
  port: raw.PORT,
  mongodbUri: raw.MONGODB_URI,
  logLevel: raw.LOG_LEVEL,
  jwtAccessSecret: raw.JWT_ACCESS_SECRET,
  refreshTokenTtlDays: raw.REFRESH_TOKEN_TTL_DAYS,
  corsOrigins: raw.CORS_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
  frontendUrl: raw.FRONTEND_URL,
  rateLimitWindowMs: raw.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: raw.RATE_LIMIT_MAX,
  authRateLimitMax: raw.AUTH_RATE_LIMIT_MAX,
  smtpHost: raw.SMTP_HOST,
  smtpPort: raw.SMTP_PORT ?? (raw.SMTP_HOST ? 587 : undefined),
  smtpUser: raw.SMTP_USER,
  smtpPass: raw.SMTP_PASS,
  smtpFrom: raw.SMTP_FROM,
}));

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues.map((issue) => {
    const path = issue.path.join(".");
    return `${path}: ${issue.message}`;
  });
  throw new Error(`Invalid environment configuration:\n- ${issues.join("\n- ")}`);
}

export const env = result.data;

export type Env = z.infer<typeof envSchema>;
