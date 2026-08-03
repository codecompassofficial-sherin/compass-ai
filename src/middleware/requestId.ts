import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

const HEADER_NAME = "x-request-id";
const SAFE_ID_PATTERN = /^[A-Za-z0-9-]{1,128}$/;

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers[HEADER_NAME];
  const candidate = typeof incoming === "string" ? incoming : undefined;
  const id = candidate !== undefined && SAFE_ID_PATTERN.test(candidate) ? candidate : randomUUID();
  req.id = id;
  res.setHeader("X-Request-ID", id);
  next();
}
