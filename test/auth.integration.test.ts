process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";
process.env.JWT_ACCESS_SECRET = "test-only-access-secret-0123456789abcdef";
process.env.CORS_ORIGINS = "http://localhost:3000";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/compass-ai-test";

import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { Express } from "express";
import request from "supertest";
import type { Response } from "supertest";

let createApp: () => Express;
let connectMongo: (uri: string) => Promise<void>;
let disconnectMongo: () => Promise<void>;
let authService: {
  requestVerificationEmail: (userId: string) => Promise<string | undefined>;
  forgotPassword: (input: { email: string }) => Promise<string | undefined>;
};
let mongoServer: { stop: () => Promise<boolean>; getUri: (db?: string) => string };

let app: Express;

before(
  async () => {
    ({ createApp } = await import("../src/app.js"));
    ({ connectMongo, disconnectMongo } = await import("../src/shared/database/mongo.js"));
    ({ authService } = await import("../src/modules/auth/auth.service.js"));
    const { MongoMemoryServer } = await import("mongodb-memory-server");

    mongoServer = await MongoMemoryServer.create();
    await connectMongo(mongoServer.getUri("compass-ai-test"));
    app = createApp();
  },
  { timeout: 180_000 },
);

after(async () => {
  await disconnectMongo();
  await mongoServer?.stop();
});

const COOKIE_NAME = "compass_refresh_token";
const USER_AGENT = "compass-integration-test/1.0";
const API = "/api/v1/auth";

function registerBody(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    firstName: "Jane",
    lastName: "Doe",
    email: `jane.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`,
    password: "StrongPassword123!",
    ...overrides,
  };
}

function getRefreshCookie(res: Response): string | null {
  const setCookie = res.headers["set-cookie"];
  if (!setCookie) {
    return null;
  }
  const raw = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  const match = /^compass_refresh_token=([^;]+)/.exec(raw);
  return match ? (match[1] ?? null) : null;
}

function cookieHeader(refreshToken: string): string {
  return `${COOKIE_NAME}=${refreshToken}`;
}

async function register(overrides?: Partial<Record<string, unknown>>): Promise<{
  res: Response;
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
}> {
  const body = registerBody(overrides);
  const res = await request(app).post(`${API}/register`).set("User-Agent", USER_AGENT).send(body);
  assert.equal(res.status, 201);
  const refreshToken = getRefreshCookie(res);
  assert.ok(refreshToken, "expected a refresh cookie");
  const accessToken = res.body.data.accessToken;
  assert.equal(typeof accessToken, "string");
  return {
    res,
    accessToken,
    refreshToken,
    userId: res.body.data.user.id,
    email: body.email as string,
  };
}

describe("register", () => {
  it("creates a user, returns an access token, and sets an HttpOnly refresh cookie", async () => {
    const { res, accessToken, email } = await register();

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, email);
    assert.equal(res.body.data.user.role, "USER");
    assert.equal(res.body.data.user.isEmailVerified, false);
    assert.equal(res.body.data.user.passwordHash, undefined);
    assert.equal(typeof accessToken, "string");

    const setCookie = Array.isArray(res.headers["set-cookie"])
      ? res.headers["set-cookie"][0]
      : res.headers["set-cookie"];
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Lax/i);
    assert.match(setCookie, /Path=\/api\/v1\/auth/i);
  });

  it("rejects a duplicate email with 409", async () => {
    const body = registerBody();
    await register({ email: body.email });
    const res = await request(app).post(`${API}/register`).send(body);
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "EMAIL_ALREADY_EXISTS");
  });

  it("rejects invalid payloads with 400 VALIDATION_ERROR", async () => {
    const shortPassword = await request(app)
      .post(`${API}/register`)
      .send(registerBody({ password: "short" }));
    assert.equal(shortPassword.status, 400);
    assert.equal(shortPassword.body.error.code, "VALIDATION_ERROR");

    const missingName = await request(app)
      .post(`${API}/register`)
      .send(registerBody({ lastName: undefined }));
    assert.equal(missingName.status, 400);
    assert.equal(missingName.body.error.code, "VALIDATION_ERROR");

    const badEmail = await request(app)
      .post(`${API}/register`)
      .send(registerBody({ email: "not-an-email" }));
    assert.equal(badEmail.status, 400);
  });
});

describe("login", () => {
  it("returns tokens and updates lastLoginAt", async () => {
    const body = registerBody();
    await register({ email: body.email });

    const res = await request(app)
      .post(`${API}/login`)
      .set("User-Agent", USER_AGENT)
      .send({ email: body.email, password: body.password });

    assert.equal(res.status, 200);
    assert.equal(typeof res.body.data.accessToken, "string");
    assert.ok(getRefreshCookie(res));
    assert.equal(res.body.data.user.email, body.email);
  });

  it("rejects a wrong password and an unknown email with 401 INVALID_CREDENTIALS", async () => {
    const body = registerBody();
    await register({ email: body.email });

    const wrongPassword = await request(app)
      .post(`${API}/login`)
      .send({ email: body.email, password: "WrongPassword999" });
    assert.equal(wrongPassword.status, 401);
    assert.equal(wrongPassword.body.error.code, "INVALID_CREDENTIALS");

    const unknownEmail = await request(app)
      .post(`${API}/login`)
      .send({ email: "nobody@example.com", password: "Whatever123" });
    assert.equal(unknownEmail.status, 401);
    assert.equal(unknownEmail.body.error.code, "INVALID_CREDENTIALS");
  });
});

describe("GET /auth/me", () => {
  it("returns the current user for a valid access token", async () => {
    const { accessToken, email } = await register();

    const res = await request(app)
      .get(`${API}/me`)
      .set("Authorization", `Bearer ${accessToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.email, email);
    assert.equal(res.body.data.user.passwordHash, undefined);
  });

  it("rejects missing, malformed, and invalid tokens with 401", async () => {
    const missing = await request(app).get(`${API}/me`);
    assert.equal(missing.status, 401);
    assert.equal(missing.body.error.code, "INVALID_ACCESS_TOKEN");

    const malformed = await request(app)
      .get(`${API}/me`)
      .set("Authorization", "Bearer");
    assert.equal(malformed.status, 401);

    const garbage = await request(app)
      .get(`${API}/me`)
      .set("Authorization", "Bearer not.a.valid.jwt");
    assert.equal(garbage.status, 401);
    assert.equal(garbage.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});

describe("refresh token rotation", () => {
  it("issues a new token pair and invalidates the used refresh token", async () => {
    const { refreshToken: first } = await register();

    const firstRefresh = await request(app)
      .post(`${API}/refresh`)
      .set("User-Agent", USER_AGENT)
      .set("Cookie", cookieHeader(first));
    assert.equal(firstRefresh.status, 200);
    assert.equal(typeof firstRefresh.body.data.accessToken, "string");
    const second = getRefreshCookie(firstRefresh);
    assert.ok(second);
    assert.notEqual(second, first);

    const replay = await request(app)
      .post(`${API}/refresh`)
      .set("Cookie", cookieHeader(first));
    assert.equal(replay.status, 401);
    assert.equal(replay.body.error.code, "INVALID_REFRESH_TOKEN");

    const secondRefresh = await request(app)
      .post(`${API}/refresh`)
      .set("Cookie", cookieHeader(second));
    assert.equal(secondRefresh.status, 200);
    assert.ok(getRefreshCookie(secondRefresh));
  });

  it("rejects a request with no refresh cookie", async () => {
    const res = await request(app).post(`${API}/refresh`);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_REFRESH_TOKEN");
  });
});

describe("logout", () => {
  it("revokes the session so its refresh token can no longer be used", async () => {
    const { refreshToken } = await register();

    const logout = await request(app)
      .post(`${API}/logout`)
      .set("Cookie", cookieHeader(refreshToken));
    assert.equal(logout.status, 200);
    assert.equal(logout.body.success, true);

    const refreshAfterLogout = await request(app)
      .post(`${API}/refresh`)
      .set("Cookie", cookieHeader(refreshToken));
    assert.equal(refreshAfterLogout.status, 401);
  });

  it("is idempotent when no session matches", async () => {
    const res = await request(app).post(`${API}/logout`).set("Cookie", "compass_refresh_token=stale-token");
    assert.equal(res.status, 200);
  });
});

describe("logout-all", () => {
  it("revokes every session for the authenticated user", async () => {
    const { refreshToken, accessToken } = await register();

    const logoutAll = await request(app)
      .post(`${API}/logout-all`)
      .set("Authorization", `Bearer ${accessToken}`);
    assert.equal(logoutAll.status, 200);

    const refreshAfter = await request(app)
      .post(`${API}/refresh`)
      .set("Cookie", cookieHeader(refreshToken));
    assert.equal(refreshAfter.status, 401);
  });

  it("requires authentication", async () => {
    const res = await request(app).post(`${API}/logout-all`);
    assert.equal(res.status, 401);
  });
});

describe("email verification", () => {
  it("verifies a user with a valid token and marks the token single-use", async () => {
    const { userId, accessToken } = await register();

    const token = await authService.requestVerificationEmail(userId);
    assert.equal(typeof token, "string");

    const verify = await request(app).post(`${API}/verify-email`).send({ token });
    assert.equal(verify.status, 200);
    assert.equal(verify.body.data.emailVerified, true);

    const me = await request(app)
      .get(`${API}/me`)
      .set("Authorization", `Bearer ${accessToken}`);
    assert.equal(me.body.data.user.isEmailVerified, true);

    const replay = await request(app).post(`${API}/verify-email`).send({ token });
    assert.equal(replay.status, 400);
    assert.equal(replay.body.error.code, "INVALID_VERIFICATION_TOKEN");
  });

  it("rejects an invalid token", async () => {
    const res = await request(app).post(`${API}/verify-email`).send({ token: "garbage-token" });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "INVALID_VERIFICATION_TOKEN");
  });
});

describe("password reset", () => {
  it("completes the forgot/reset flow and invalidates old sessions", async () => {
    const { email, refreshToken } = await register();

    const token = await authService.forgotPassword({ email });
    assert.equal(typeof token, "string");

    const reset = await request(app)
      .post(`${API}/reset-password`)
      .send({ token, password: "NewStrongPassword123!" });
    assert.equal(reset.status, 200);
    assert.equal(reset.body.data.passwordReset, true);

    const oldPassword = await request(app)
      .post(`${API}/login`)
      .send({ email, password: "StrongPassword123!" });
    assert.equal(oldPassword.status, 401);

    const newPassword = await request(app)
      .post(`${API}/login`)
      .send({ email, password: "NewStrongPassword123!" });
    assert.equal(newPassword.status, 200);

    const refreshAfterReset = await request(app)
      .post(`${API}/refresh`)
      .set("Cookie", cookieHeader(refreshToken));
    assert.equal(refreshAfterReset.status, 401);

    const replay = await request(app)
      .post(`${API}/reset-password`)
      .send({ token, password: "AnotherPassword123!" });
    assert.equal(replay.status, 400);
    assert.equal(replay.body.error.code, "INVALID_RESET_TOKEN");
  });

  it("returns 200 for unknown emails without leaking account existence", async () => {
    const res = await request(app).post(`${API}/forgot-password`).send({ email: "nobody@example.com" });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
