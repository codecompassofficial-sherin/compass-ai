import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { env } from "../../config/env.js";
import { sendMail } from "../../shared/services/mailer.js";
import { logger } from "../../shared/logger/logger.js";
import {
  ACCESS_TOKEN_TTL,
  BCRYPT_ROUNDS,
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  PASSWORD_RESET_TOKEN_BYTES,
  PASSWORD_RESET_TOKEN_TTL_MS,
  REFRESH_TOKEN_BYTES,
  VERIFICATION_TOKEN_BYTES,
} from "./auth.constants.js";
import { authErrors } from "./auth.errors.js";
import { authRepository } from "./auth.repository.js";
import { toPublicUser } from "../users/user.mapper.js";
import type { UserDocument } from "../users/user.model.js";
import type { PublicUser, Role } from "../users/user.types.js";
import type {
  AuthSessionResult,
  AuthTokens,
  SessionContext,
} from "./auth.types.js";
import type { ForgotPasswordInput, LoginInput, RegisterInput } from "./auth.validation.js";

function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

function generateRefreshToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString("base64url");
}

function generateVerificationToken(): string {
  return randomBytes(VERIFICATION_TOKEN_BYTES).toString("base64url");
}

function generateResetToken(): string {
  return randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function signAccessToken(user: UserDocument): string {
  return jwt.sign({ role: user.role }, env.jwtAccessSecret, {
    subject: user._id.toString(),
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

function verifyAccessToken(token: string): { sub: string; role: Role } {
  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(token, env.jwtAccessSecret);
  } catch {
    throw authErrors.invalidAccessToken();
  }
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw authErrors.invalidAccessToken();
  }
  return { sub: payload.sub, role: payload.role as Role };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function createSessionForUser(
  userId: Types.ObjectId,
  ctx: SessionContext,
): Promise<string> {
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * 24 * 60 * 60 * 1000);
  await authRepository.createSession({
    userId,
    refreshTokenHash: hashToken(refreshToken),
    device: ctx.device,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
    expiresAt,
  });
  return refreshToken;
}

async function sendVerificationEmail(user: UserDocument): Promise<string | undefined> {
  const token = generateVerificationToken();
  await authRepository.createEmailVerificationToken({
    userId: user._id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
  });
  const url = `${env.frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
  try {
    await sendMail({
      to: user.email,
      subject: "Verify your Compass AI email",
      html:
        `<p>Hi ${escapeHtml(user.firstName)},</p>` +
        `<p>Verify your email address by clicking the link below:</p>` +
        `<p><a href="${url}">${url}</a></p>` +
        `<p>This link expires in 24 hours.</p>`,
    });
  } catch (err) {
    logger.error({ err, userId: user._id.toString() }, "Failed to send verification email");
    return undefined;
  }
  return env.nodeEnv === "production" ? undefined : token;
}

async function sendPasswordResetEmail(user: UserDocument): Promise<string | undefined> {
  const token = generateResetToken();
  await authRepository.createPasswordResetToken({
    userId: user._id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
  });
  const url = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail({
    to: user.email,
    subject: "Reset your Compass AI password",
    html:
      `<p>Hi ${escapeHtml(user.firstName)},</p>` +
      `<p>We received a request to reset your password. Click the link below to set a new one:</p>` +
      `<p><a href="${url}">${url}</a></p>` +
      `<p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>`,
  });
  return env.nodeEnv === "production" ? undefined : token;
}

async function register(input: RegisterInput, ctx: SessionContext): Promise<AuthSessionResult> {
  const existing = await authRepository.findUserByEmail(input.email);
  if (existing) {
    throw authErrors.emailAlreadyExists();
  }

  const passwordHash = await hashPassword(input.password);
  const user = await authRepository.createUser({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash,
  });

  const refreshToken = await createSessionForUser(user._id, ctx);
  const accessToken = signAccessToken(user);

  sendVerificationEmail(user).catch((err: unknown) => {
    logger.error({ err, userId: user._id.toString() }, "Failed to send verification email");
  });

  return { user: toPublicUser(user), accessToken, refreshToken };
}

async function login(input: LoginInput, ctx: SessionContext): Promise<AuthSessionResult> {
  const user = await authRepository.findUserByEmail(input.email);
  if (!user) {
    throw authErrors.invalidCredentials();
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw authErrors.invalidCredentials();
  }

  await authRepository.updateLastLogin(user._id.toString(), new Date());
  const refreshToken = await createSessionForUser(user._id, ctx);
  const accessToken = signAccessToken(user);

  return { user: toPublicUser(user), accessToken, refreshToken };
}

async function refresh(refreshToken: string, ctx: SessionContext): Promise<AuthTokens> {
  const session = await authRepository.findSessionByTokenHash(hashToken(refreshToken));
  if (!session) {
    throw authErrors.invalidRefreshToken();
  }
  if (session.revokedAt) {
    throw authErrors.invalidRefreshToken();
  }
  if (session.expiresAt.getTime() <= Date.now()) {
    throw authErrors.invalidRefreshToken();
  }

  const user = await authRepository.findUserById(session.userId.toString());
  if (!user) {
    throw authErrors.invalidRefreshToken();
  }

  await authRepository.revokeSession(session._id, new Date());
  const newRefreshToken = await createSessionForUser(user._id, ctx);

  return { accessToken: signAccessToken(user), refreshToken: newRefreshToken };
}

async function logout(refreshToken: string): Promise<void> {
  const session = await authRepository.findSessionByTokenHash(hashToken(refreshToken));
  if (session) {
    await authRepository.revokeSession(session._id, new Date());
  }
}

async function logoutAll(userId: string): Promise<void> {
  await authRepository.revokeAllUserSessions(userId);
}

async function getPublicUser(userId: string): Promise<PublicUser> {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw authErrors.invalidAccessToken();
  }
  return toPublicUser(user);
}

async function requestVerificationEmail(userId: string): Promise<string | undefined> {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw authErrors.invalidAccessToken();
  }
  return sendVerificationEmail(user);
}

async function verifyEmail(token: string): Promise<void> {
  const record = await authRepository.findEmailVerificationToken(hashToken(token));
  if (!record || record.usedAt) {
    throw authErrors.invalidVerificationToken();
  }
  if (record.expiresAt.getTime() <= Date.now()) {
    throw authErrors.invalidVerificationToken();
  }
  await authRepository.markEmailVerificationTokenUsed(record._id, new Date());
  await authRepository.setEmailVerified(record.userId.toString());
}

async function forgotPassword(input: ForgotPasswordInput): Promise<string | undefined> {
  const user = await authRepository.findUserByEmail(input.email);
  if (!user) {
    return undefined;
  }
  try {
    return await sendPasswordResetEmail(user);
  } catch (err) {
    logger.error({ err, userId: user._id.toString() }, "Failed to send password reset email");
    return undefined;
  }
}

async function resetPassword(token: string, newPassword: string): Promise<void> {
  const record = await authRepository.findPasswordResetToken(hashToken(token));
  if (!record || record.usedAt) {
    throw authErrors.invalidResetToken();
  }
  if (record.expiresAt.getTime() <= Date.now()) {
    throw authErrors.invalidResetToken();
  }

  const passwordHash = await hashPassword(newPassword);
  await authRepository.updatePasswordHash(record.userId.toString(), passwordHash);
  await authRepository.markPasswordResetTokenUsed(record._id, new Date());
  await authRepository.revokeAllUserSessions(record.userId.toString());
}

export const authService = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getPublicUser,
  requestVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword,
  verifyAccessToken,
};
