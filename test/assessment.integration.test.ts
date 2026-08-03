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
const API = "/api/v1/assessment";

function registerBody(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    firstName: "Jane",
    lastName: "Doe",
    email: `jane.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`,
    password: "StrongPassword123!",
    ...overrides,
  };
}

function assessmentBody(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    targetRole: "Backend Developer",
    experienceLevel: "Intermediate",
    technologyPreferences: ["MERN"],
    currentSkills: ["JavaScript", "Node.js", "SQL"],
    primaryCareerGoal: "Career Switch",
    additionalNotes: "Focused on backend services and cloud.",
    targetTimeline: "6 Months",
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
    accessToken,
    refreshToken,
    userId: res.body.data.user.id,
    email: body.email as string,
  };
}

function authHeader(accessToken: string): string {
  return `Bearer ${accessToken}`;
}

describe("POST /api/v1/assessment", () => {
  it("creates an assessment for the authenticated user", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .post(API)
      .set("Authorization", authHeader(accessToken))
      .send(assessmentBody());

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    const assessment = res.body.data.assessment;
    assert.equal(typeof assessment.id, "string");
    assert.equal(assessment.targetRole, "Backend Developer");
    assert.equal(assessment.experienceLevel, "Intermediate");
    assert.deepEqual(assessment.technologyPreferences, ["MERN"]);
    assert.deepEqual(assessment.currentSkills, ["JavaScript", "Node.js", "SQL"]);
    assert.equal(assessment.primaryCareerGoal, "Career Switch");
    assert.equal(assessment.additionalNotes, "Focused on backend services and cloud.");
    assert.equal(assessment.targetTimeline, "6 Months");
    assert.equal(typeof assessment.createdAt, "string");
    assert.equal(typeof assessment.updatedAt, "string");
    assert.equal(assessment.userId, undefined);
  });

  it("rejects a duplicate assessment with 409", async () => {
    const { accessToken } = await register();

    await request(app)
      .post(API)
      .set("Authorization", authHeader(accessToken))
      .send(assessmentBody());
    const res = await request(app)
      .post(API)
      .set("Authorization", authHeader(accessToken))
      .send(assessmentBody({ primaryCareerGoal: "Skill Advancement" }));

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "ASSESSMENT_ALREADY_EXISTS");
  });

  it("rejects invalid payloads with 400 VALIDATION_ERROR", async () => {
    const { accessToken } = await register();
    const auth = authHeader(accessToken);

    const badRole = await request(app)
      .post(API)
      .set("Authorization", auth)
      .send(assessmentBody({ targetRole: "CEO" }));
    assert.equal(badRole.status, 400);
    assert.equal(badRole.body.error.code, "VALIDATION_ERROR");

    const badExperience = await request(app)
      .post(API)
      .set("Authorization", auth)
      .send(assessmentBody({ experienceLevel: "Expert" }));
    assert.equal(badExperience.status, 400);

    const emptyPreferences = await request(app)
      .post(API)
      .set("Authorization", auth)
      .send(assessmentBody({ technologyPreferences: [] }));
    assert.equal(emptyPreferences.status, 400);

    const badSkill = await request(app)
      .post(API)
      .set("Authorization", auth)
      .send(assessmentBody({ currentSkills: ["COBOL"] }));
    assert.equal(badSkill.status, 400);

    const duplicateSkills = await request(app)
      .post(API)
      .set("Authorization", auth)
      .send(assessmentBody({ currentSkills: ["JavaScript", "JavaScript"] }));
    assert.equal(duplicateSkills.status, 400);

    const badGoal = await request(app)
      .post(API)
      .set("Authorization", auth)
      .send(assessmentBody({ primaryCareerGoal: "Become a CEO" }));
    assert.equal(badGoal.status, 400);

    const longNotes = await request(app)
      .post(API)
      .set("Authorization", auth)
      .send(assessmentBody({ additionalNotes: "x".repeat(501) }));
    assert.equal(longNotes.status, 400);

    const missingRole = await request(app)
      .post(API)
      .set("Authorization", auth)
      .send(assessmentBody({ targetRole: undefined }));
    assert.equal(missingRole.status, 400);
  });

  it("rejects unauthenticated requests with 401", async () => {
    const noToken = await request(app).post(API).send(assessmentBody());
    assert.equal(noToken.status, 401);
    assert.equal(noToken.body.error.code, "INVALID_ACCESS_TOKEN");

    const badToken = await request(app)
      .post(API)
      .set("Authorization", "Bearer not-a-real-token")
      .send(assessmentBody());
    assert.equal(badToken.status, 401);
    assert.equal(badToken.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});

describe("GET /api/v1/assessment", () => {
  it("returns the assessment for the authenticated user", async () => {
    const { accessToken } = await register();
    const created = await request(app)
      .post(API)
      .set("Authorization", authHeader(accessToken))
      .send(assessmentBody());

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.assessment.id, created.body.data.assessment.id);
    assert.equal(res.body.data.assessment.primaryCareerGoal, "Career Switch");
    assert.deepEqual(res.body.data.assessment.currentSkills, ["JavaScript", "Node.js", "SQL"]);
  });

  it("returns 404 when no assessment exists", async () => {
    const { accessToken } = await register();

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, "ASSESSMENT_NOT_FOUND");
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get(API);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});

describe("PATCH /api/v1/assessment", () => {
  it("updates assessment fields and reflects them on GET", async () => {
    const { accessToken } = await register();
    await request(app)
      .post(API)
      .set("Authorization", authHeader(accessToken))
      .send(assessmentBody());

    const res = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({
        targetRole: "Full Stack Developer",
        primaryCareerGoal: "Career Advancement",
        technologyPreferences: ["MERN", "React Native"],
        additionalNotes: "Now interested in mobile too.",
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.assessment.targetRole, "Full Stack Developer");
    assert.equal(res.body.data.assessment.primaryCareerGoal, "Career Advancement");
    assert.deepEqual(res.body.data.assessment.technologyPreferences, ["MERN", "React Native"]);
    assert.equal(res.body.data.assessment.additionalNotes, "Now interested in mobile too.");
    assert.equal(res.body.data.assessment.experienceLevel, "Intermediate");
    assert.equal(res.body.data.assessment.targetTimeline, "6 Months");

    const getRes = await request(app).get(API).set("Authorization", authHeader(accessToken));
    assert.equal(getRes.body.data.assessment.targetRole, "Full Stack Developer");
  });

  it("adds additionalNotes when it was absent", async () => {
    const { accessToken } = await register();
    await request(app)
      .post(API)
      .set("Authorization", authHeader(accessToken))
      .send(assessmentBody({ additionalNotes: undefined }));

    const res = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({ additionalNotes: "Prefers remote roles." });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.assessment.additionalNotes, "Prefers remote roles.");
  });

  it("returns 404 when no assessment exists", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({ targetRole: "Frontend Developer" });

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, "ASSESSMENT_NOT_FOUND");
  });

  it("rejects an empty payload with 400 VALIDATION_ERROR", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({});

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  });

  it("rejects invalid enum values with 400 VALIDATION_ERROR", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .patch(API)
      .set("Authorization", authHeader(accessToken))
      .send({ targetTimeline: "Forever" });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).patch(API).send({ targetRole: "Frontend Developer" });
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});

describe("one assessment per user", () => {
  it("keeps assessments isolated between users and enforces a single active assessment", async () => {
    const userA = await register();
    const userB = await register();

    const createA = await request(app)
      .post(API)
      .set("Authorization", authHeader(userA.accessToken))
      .send(assessmentBody());
    assert.equal(createA.status, 201);

    const createB = await request(app)
      .post(API)
      .set("Authorization", authHeader(userB.accessToken))
      .send(assessmentBody({ targetRole: "DevOps Engineer" }));
    assert.equal(createB.status, 201);

    const duplicateA = await request(app)
      .post(API)
      .set("Authorization", authHeader(userA.accessToken))
      .send(assessmentBody());
    assert.equal(duplicateA.status, 409);

    const getA = await request(app)
      .get(API)
      .set("Authorization", authHeader(userA.accessToken));
    assert.equal(getA.body.data.assessment.id, createA.body.data.assessment.id);
    assert.equal(getA.body.data.assessment.targetRole, "Backend Developer");

    const getB = await request(app)
      .get(API)
      .set("Authorization", authHeader(userB.accessToken));
    assert.equal(getB.body.data.assessment.id, createB.body.data.assessment.id);
    assert.equal(getB.body.data.assessment.targetRole, "DevOps Engineer");
  });
});
