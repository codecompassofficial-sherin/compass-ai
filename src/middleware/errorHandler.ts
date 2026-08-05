import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../shared/common/AppError.js";
import { errorBody } from "../shared/common/ApiResponse.js";
import { logger } from "../shared/logger/logger.js";

function isBodyParserError(err: unknown): err is { type: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    typeof (err as { type?: unknown }).type === "string"
  );
}

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

  if (isBodyParserError(err)) {
    if (err.type === "entity.parse.failed") {
      logger.warn({ err, reqId: req.id }, "Malformed JSON request body");
      res.status(400).json({
        success: false,
        error: errorBody("Invalid JSON request body", { code: "INVALID_JSON" }),
      });
      return;
    }
    if (err.type === "entity.too.large") {
      logger.warn({ err, reqId: req.id }, "Request body exceeds the size limit");
      res.status(413).json({
        success: false,
        error: errorBody("Request body is too large", { code: "PAYLOAD_TOO_LARGE" }),
      });
      return;
    }
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
