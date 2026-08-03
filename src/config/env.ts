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
});

const envSchema = rawEnvSchema.transform((raw) => ({
  nodeEnv: raw.NODE_ENV,
  host: raw.HOST,
  port: raw.PORT,
  mongodbUri: raw.MONGODB_URI,
  logLevel: raw.LOG_LEVEL,
}));

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const issues = result.error.issues.map((issue) => {
    const path = issue.path.join(".");
    const input = typeof issue.input === "string" ? issue.input : undefined;
    return `${path}${input ? ` (received: ${JSON.stringify(input)})` : ""}: ${issue.message}`;
  });
  throw new Error(`Invalid environment configuration:\n- ${issues.join("\n- ")}`);
}

export const env = result.data;

export type Env = z.infer<typeof envSchema>;
