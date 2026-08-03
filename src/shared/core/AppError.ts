export interface AppErrorOptions {
  code?: string;
  details?: unknown;
  isOperational?: boolean;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, options: AppErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = options.code;
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;
    Error.captureStackTrace(this, new.target);
  }

  static badRequest(message = "Bad request", options?: AppErrorOptions): AppError {
    return new AppError(message, 400, { code: "BAD_REQUEST", ...options });
  }

  static unauthorized(message = "Unauthorized", options?: AppErrorOptions): AppError {
    return new AppError(message, 401, { code: "UNAUTHORIZED", ...options });
  }

  static forbidden(message = "Forbidden", options?: AppErrorOptions): AppError {
    return new AppError(message, 403, { code: "FORBIDDEN", ...options });
  }

  static notFound(message = "Resource not found", options?: AppErrorOptions): AppError {
    return new AppError(message, 404, { code: "NOT_FOUND", ...options });
  }

  static conflict(message = "Conflict", options?: AppErrorOptions): AppError {
    return new AppError(message, 409, { code: "CONFLICT", ...options });
  }

  static serviceUnavailable(
    message = "Service unavailable",
    options?: AppErrorOptions,
  ): AppError {
    return new AppError(message, 503, { code: "SERVICE_UNAVAILABLE", ...options });
  }
}
