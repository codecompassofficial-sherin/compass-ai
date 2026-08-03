import type { NextFunction, Request, Response } from "express";
import { authErrors } from "./auth.errors.js";
import { authRepository } from "./auth.repository.js";
import { authService } from "./auth.service.js";
import type { Role } from "./auth.types.js";

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw authErrors.invalidAccessToken();
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw authErrors.invalidAccessToken();
    }

    const payload = authService.verifyAccessToken(token);
    const user = await authRepository.findUserById(payload.sub);
    if (!user) {
      throw authErrors.invalidAccessToken();
    }

    req.auth = { user: { id: payload.sub, role: user.role } };
    next();
  } catch (err) {
    next(err);
  }
}

export function authorize(
  ...roles: Role[]
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    const role = req.auth?.user.role;
    if (!role || !roles.includes(role)) {
      next(authErrors.insufficientPermissions());
      return;
    }
    next();
  };
}
