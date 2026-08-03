import express from "express";
import type { Express } from "express";
import { apiRouter } from "./api/index.js";
import { API_ROOT, BODY_LIMIT } from "./config/constants.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requestId } from "./middleware/requestId.js";
import { httpLogger } from "./shared/logger/logger.js";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");

  app.use(requestId);
  app.use(httpLogger);
  app.use(express.json({ limit: BODY_LIMIT }));

  app.use(API_ROOT, apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
