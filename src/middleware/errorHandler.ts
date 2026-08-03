import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../shared/core/AppError.js";
import { errorBody } from "../shared/core/ApiResponse.js";
import { logger } from "../shared/logger/logger.js";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    if (err.isOperational) {
      logger.warn({ err, reqId: req.id }, "Operational error");
    } else {
      logger.error({ err, reqId: req.id }, "Non-operational error");
    }
    res.status(err.statusCode).json({
      success: false,
      error: errorBody(err.message, { code: err.code, details: err.details }),
    });
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    res.status(400).json({
      success: false,
      error: errorBody("Validation failed", { code: "VALIDATION_ERROR", details }),
    });
    return;
  }

  logger.error({ err, reqId: req.id }, "Unhandled error");
  res.status(500).json({
    success: false,
    error: errorBody("Internal server error", { code: "INTERNAL_SERVER_ERROR" }),
  });
}
