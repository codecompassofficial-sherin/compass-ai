import type { CookieOptions, Request, Response } from "express";
import { env } from "../../config/env.js";
import { success } from "../../shared/common/ApiResponse.js";
import {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH,
} from "./auth.constants.js";
import { authErrors } from "./auth.errors.js";
import { authService } from "./auth.service.js";
import type { SessionContext } from "./auth.types.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./auth.validation.js";

function extractSessionContext(req: Request): SessionContext {
  const deviceHeader = req.headers["x-device-name"];
  return {
    device:
      typeof deviceHeader === "string" && deviceHeader.length > 0
        ? deviceHeader
        : "unknown",
    ip: req.ip ?? "unknown",
    userAgent:
      typeof req.headers["user-agent"] === "string"
        ? req.headers["user-agent"]
        : "unknown",
  };
}

function refreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: REFRESH_TOKEN_COOKIE_PATH,
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
  };
}

function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshCookieOptions());
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, { path: REFRESH_TOKEN_COOKIE_PATH });
}

export const authController = {
  register: async (req: Request, res: Response): Promise<void> => {
    const result = await authService.register(
      req.body as RegisterInput,
      extractSessionContext(req),
    );
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json(success({ user: result.user, accessToken: result.accessToken }));
  },

  login: async (req: Request, res: Response): Promise<void> => {
    const result = await authService.login(
      req.body as LoginInput,
      extractSessionContext(req),
    );
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json(success({ user: result.user, accessToken: result.accessToken }));
  },

  refresh: async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    if (typeof refreshToken !== "string") {
      throw authErrors.invalidRefreshToken();
    }
    const tokens = await authService.refresh(refreshToken, extractSessionContext(req));
    setRefreshCookie(res, tokens.refreshToken);
    res.status(200).json(success({ accessToken: tokens.accessToken }));
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    if (typeof refreshToken === "string") {
      await authService.logout(refreshToken);
    }
    clearRefreshCookie(res);
    res.status(200).json(success(null));
  },

  logoutAll: async (req: Request, res: Response): Promise<void> => {
    await authService.logoutAll(req.auth!.user.id);
    clearRefreshCookie(res);
    res.status(200).json(success(null));
  },

  getMe: async (req: Request, res: Response): Promise<void> => {
    const user = await authService.getPublicUser(req.auth!.user.id);
    res.status(200).json(success({ user }));
  },

  verifyEmail: async (req: Request, res: Response): Promise<void> => {
    await authService.verifyEmail((req.body as VerifyEmailInput).token);
    res.status(200).json(success({ emailVerified: true }));
  },

  forgotPassword: async (req: Request, res: Response): Promise<void> => {
    await authService.forgotPassword(req.body as ForgotPasswordInput);
    res
      .status(200)
      .json(
        success({
          message: "If an account exists for this email, a password reset link has been sent",
        }),
      );
  },

  resetPassword: async (req: Request, res: Response): Promise<void> => {
    const input = req.body as ResetPasswordInput;
    await authService.resetPassword(input.token, input.password);
    clearRefreshCookie(res);
    res.status(200).json(success({ passwordReset: true }));
  },
};
