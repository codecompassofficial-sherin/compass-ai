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
let mongoServer: { stop: () => Promise<boolean>; getUri: (db?: string) => string };

let app: Express;

before(
  async () => {
    ({ createApp } = await import("../src/app.js"));
    ({ connectMongo, disconnectMongo } = await import("../src/shared/database/mongo.js"));
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

const USER_AGENT = "compass-integration-test/1.0";
const AUTH_API = "/api/v1/auth";
const API = "/api/v1/profile";

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

async function register(): Promise<{
  res: Response;
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
}> {
  const body = registerBody();
  const res = await request(app).post(`${AUTH_API}/register`).set("User-Agent", USER_AGENT).send(body);
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

function authHeader(accessToken: string): string {
  return `Bearer ${accessToken}`;
}

describe("GET /api/v1/profile", () => {
  it("returns the current user for an authenticated request", async () => {
    const { accessToken, email } = await register();

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, email);
    assert.equal(res.body.data.user.firstName, "Jane");
    assert.equal(res.body.data.user.lastName, "Doe");
    assert.equal(res.body.data.user.role, "USER");
    assert.equal(res.body.data.user.isEmailVerified, false);
    assert.equal(typeof res.body.data.user.createdAt, "string");
    assert.equal(res.body.data.user.passwordHash, undefined);
  });

  it("rejects a missing token with 401 INVALID_ACCESS_TOKEN", async () => {
    const res = await request(app).get(API);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });

  it("rejects an invalid token with 401 INVALID_ACCESS_TOKEN", async () => {
    const res = await request(app).get(API).set("Authorization", "Bearer not-a-real-token");
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});

describe("PATCH /api/v1/profile", () => {
  it("updates the first name", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({ firstName: "Janet" });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Profile updated successfully.");
    assert.equal(res.body.data.user.firstName, "Janet");
    assert.equal(res.body.data.user.lastName, "Doe");
  });

  it("updates the last name", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({ lastName: "Smith" });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.lastName, "Smith");
    assert.equal(res.body.data.user.firstName, "Jane");
  });

  it("updates several fields at once and reflects them on GET", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({
        firstName: "Alex",
        lastName: "Morgan",
        avatarUrl: "https://example.com/avatar.png",
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.firstName, "Alex");
    assert.equal(res.body.data.user.lastName, "Morgan");
    assert.equal(res.body.data.user.avatarUrl, "https://example.com/avatar.png");

    const getRes = await request(app).get(API).set("Authorization", authHeader(accessToken));
    assert.equal(getRes.status, 200);
    assert.equal(getRes.body.data.user.firstName, "Alex");
    assert.equal(getRes.body.data.user.lastName, "Morgan");
    assert.equal(getRes.body.data.user.avatarUrl, "https://example.com/avatar.png");
  });

  it("sets and then clears the avatar", async () => {
    const { accessToken } = await register();

    const setRes = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({ avatarUrl: "https://example.com/avatar.png" });
    assert.equal(setRes.status, 200);
    assert.equal(setRes.body.data.user.avatarUrl, "https://example.com/avatar.png");

    const clearRes = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({ avatarUrl: null });
    assert.equal(clearRes.status, 200);
    assert.equal(clearRes.body.data.user.avatarUrl, undefined);
  });

  it("rejects invalid payloads with 400 VALIDATION_ERROR", async () => {
    const { accessToken } = await register();
    const auth = authHeader(accessToken);

    const shortName = await request(app)
      .patch(API)
      .set("Authorization", auth)
      .send({ firstName: "A" });
    assert.equal(shortName.status, 400);
    assert.equal(shortName.body.error.code, "VALIDATION_ERROR");

    const badUrl = await request(app)
      .patch(API)
      .set("Authorization", auth)
      .send({ avatarUrl: "not-a-url" });
    assert.equal(badUrl.status, 400);
    assert.equal(badUrl.body.error.code, "VALIDATION_ERROR");

    const emptyBody = await request(app).patch(API).set("Authorization", auth).send({});
    assert.equal(emptyBody.status, 400);
    assert.equal(emptyBody.body.error.code, "VALIDATION_ERROR");
  });

  it("rejects an unauthorized request with 401", async () => {
    const res = await request(app).patch(API).send({ firstName: "Janet" });
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });

  it("does not allow changing the email", async () => {
    const { accessToken, email } = await register();

    const res = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({ email: "other@example.com" });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");

    const getRes = await request(app).get(API).set("Authorization", authHeader(accessToken));
    assert.equal(getRes.body.data.user.email, email);
  });

  it("does not allow changing the role", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({ role: "ADMIN" });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  });

  it("does not allow changing the password", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({ password: "NewPassword123!" });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  });
});
