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
    const { MongoMemoryReplSet } = await import("mongodb-memory-server");

    mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
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
const API = "/api/v1/jobs";

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

async function register(): Promise<{ accessToken: string; userId: string }> {
  const body = registerBody();
  const res = await request(app).post(`${AUTH_API}/register`).set("User-Agent", USER_AGENT).send(body);
  assert.equal(res.status, 201);
  const refreshToken = getRefreshCookie(res);
  assert.ok(refreshToken, "expected a refresh cookie");
  const accessToken = res.body.data.accessToken;
  assert.equal(typeof accessToken, "string");
  return { accessToken, userId: res.body.data.user.id };
}

function authHeader(accessToken: string): string {
  return `Bearer ${accessToken}`;
}

describe("GET /api/v1/jobs/health", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get(`${API}/health`);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });

  it("returns module health status for authenticated requests", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .get(`${API}/health`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, "ok");
    assert.equal(res.body.data.module, "job-intelligence");
    assert.equal(typeof res.body.data.timestamp, "string");
  });
});
