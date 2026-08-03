import { randomUUID } from "node:crypto";
import pino from "pino";
import { pinoHttp } from "pino-http";
import { APP_NAME } from "../../config/constants.js";
import { env } from "../../config/env.js";

const isDev = env.nodeEnv === "development";

export const logger = pino({
  name: APP_NAME,
  level: env.logLevel,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    censor: "[redacted]",
  },
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: { translateTime: "SYS:standard", ignore: "pid,hostname" },
        },
      }
    : {}),
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => {
    const existingId = req.id;
    if (typeof existingId === "string" || typeof existingId === "number") {
      return existingId;
    }
    const headerId = req.headers["x-request-id"];
    return typeof headerId === "string" ? headerId : randomUUID();
  },
});
