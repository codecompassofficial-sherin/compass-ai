process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/compass-ai-test";
process.env.JWT_ACCESS_SECRET = "test-only-access-secret-0123456789abcdef";
process.env.CORS_ORIGINS = "http://localhost:3000";
process.env.FRONTEND_URL = "http://localhost:3000";

import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import type { Express } from "express";
import request from "supertest";

let app: Express;

describe("body parsing errors", () => {
  before(async () => {
    const { createApp } = await import("../src/app.js");
    app = createApp();
  });

  it("returns 400 INVALID_JSON for a malformed JSON body", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email": "jane@example.com",');

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, "INVALID_JSON");
    assert.equal(typeof res.body.error.message, "string");
  });

  it("returns 413 PAYLOAD_TOO_LARGE for an oversized body", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .send({ email: "jane@example.com", password: "x".repeat(2 * 1024 * 1024) });

    assert.equal(res.status, 413);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, "PAYLOAD_TOO_LARGE");
    assert.equal(typeof res.body.error.message, "string");
  });
});
