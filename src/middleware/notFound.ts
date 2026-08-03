import type { NextFunction, Request, Response } from "express";
import { AppError } from "../shared/common/AppError.js";

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}
