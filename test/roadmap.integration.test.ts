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
const ASSESSMENT_API = "/api/v1/assessment";
const API = "/api/v1/roadmap";

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
    experienceLevel: "Beginner",
    technologyPreferences: ["MERN"],
    currentSkills: [],
    primaryCareerGoal: "First Tech Role",
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

async function createAssessment(accessToken: string, overrides: Record<string, unknown> = {}) {
  const res = await request(app)
    .post(ASSESSMENT_API)
    .set("Authorization", authHeader(accessToken))
    .send(assessmentBody(overrides));
  assert.equal(res.status, 201);
  return res;
}

describe("POST /api/v1/roadmap/generate", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).post(`${API}/generate`);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });

  it("returns 409 when no career assessment exists", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .post(`${API}/generate`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "ROADMAP_ASSESSMENT_REQUIRED");
  });

  it("creates a versioned roadmap with goals from the assessment", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);

    const res = await request(app)
      .post(`${API}/generate`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);

    const roadmap = res.body.data.roadmap;
    assert.equal(typeof roadmap.id, "string");
    assert.equal(roadmap.version, 1);
    assert.equal(roadmap.status, "active");
    assert.equal(roadmap.reason, "INITIAL");
    assert.equal(typeof roadmap.engineVersion, "string");
    assert.equal(typeof roadmap.catalogVersion, "string");
    assert.equal(typeof roadmap.generatedAt, "string");
    assert.equal(roadmap.assessmentSnapshot.targetRole, "Backend Developer");
    assert.equal(roadmap.assessmentSnapshot.experienceLevel, "Beginner");
    assert.deepEqual(roadmap.assessmentSnapshot.technologyPreferences, ["MERN"]);
    assert.equal(typeof roadmap.createdAt, "string");
    assert.equal(typeof roadmap.updatedAt, "string");

    assert.equal(roadmap.phases.length, 4);
    const phaseKeys = roadmap.phases.map((phase: { key: string }) => phase.key);
    assert.deepEqual(phaseKeys, ["foundation", "core-skills", "projects", "interview-prep"]);

    assert.ok(roadmap.goals.length > 0, "expected generated goals");
    for (const goal of roadmap.goals) {
      assert.equal(typeof goal.id, "string");
      assert.ok(phaseKeys.includes(goal.phaseKey), "goal must reference a roadmap phase");
      assert.ok(goal.order >= 1);
      assert.equal(typeof goal.templateKey, "string");
      assert.equal(goal.templateVersion, roadmap.catalogVersion);
      assert.equal(typeof goal.title, "string");
      assert.equal(typeof goal.description, "string");
      assert.ok(Array.isArray(goal.skillTargets));
      assert.ok(Array.isArray(goal.prerequisites));
      assert.ok(goal.estimatedEffortHours > 0);
      assert.ok(Array.isArray(goal.bindings.technologyPreferences));
      assert.ok(Array.isArray(goal.bindings.currentSkills));
      assert.equal(goal.status, "draft");
    }

    const firstGoal = roadmap.goals[0];
    assert.equal(firstGoal.phaseKey, "foundation");
    const lastGoal = roadmap.goals[roadmap.goals.length - 1];
    assert.equal(lastGoal.phaseKey, "interview-prep");

    const boundToMern = roadmap.goals.some((goal: { bindings: { technologyPreferences: string[] } }) =>
      goal.bindings.technologyPreferences.includes("MERN"),
    );
    assert.ok(boundToMern, "expected at least one goal bound to the MERN preference");
  });

  it("returns 409 when an active roadmap already exists", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);

    await request(app)
      .post(`${API}/generate`)
      .set("Authorization", authHeader(accessToken));

    const res = await request(app)
      .post(`${API}/generate`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "ROADMAP_ALREADY_EXISTS");
  });

  it("keeps roadmaps isolated between users", async () => {
    const userA = await register();
    const userB = await register();
    await createAssessment(userA.accessToken);

    const resA = await request(app)
      .post(`${API}/generate`)
      .set("Authorization", authHeader(userA.accessToken));
    assert.equal(resA.status, 201);

    const resB = await request(app)
      .post(`${API}/generate`)
      .set("Authorization", authHeader(userB.accessToken));
    assert.equal(resB.status, 409);
    assert.equal(resB.body.error.code, "ROADMAP_ASSESSMENT_REQUIRED");

    const getB = await request(app).get(API).set("Authorization", authHeader(userB.accessToken));
    assert.equal(getB.status, 404);
    assert.equal(getB.body.error.code, "NO_ACTIVE_ROADMAP");
  });
});

describe("GET /api/v1/roadmap", () => {
  it("returns 404 when no active roadmap exists", async () => {
    const { accessToken } = await register();

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, "NO_ACTIVE_ROADMAP");
  });

  it("returns the active roadmap with its goals", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    const generated = await request(app)
      .post(`${API}/generate`)
      .set("Authorization", authHeader(accessToken));

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.data.roadmap.id, generated.body.data.roadmap.id);
    assert.equal(res.body.data.roadmap.version, 1);
    assert.equal(res.body.data.roadmap.status, "active");
    assert.equal(res.body.data.roadmap.goals.length, generated.body.data.roadmap.goals.length);
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get(API);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});

describe("GET /api/v1/roadmap/:id", () => {
  it("rejects an invalid roadmap id with 400", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .get(`${API}/not-an-object-id`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "INVALID_ROADMAP_ID");
  });

  it("returns 404 for a nonexistent roadmap", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .get(`${API}/000000000000000000000000`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, "ROADMAP_NOT_FOUND");
  });

  it("returns the roadmap for its owner only", async () => {
    const owner = await register();
    const stranger = await register();
    await createAssessment(owner.accessToken);
    const generated = await request(app)
      .post(`${API}/generate`)
      .set("Authorization", authHeader(owner.accessToken));
    const roadmapId = generated.body.data.roadmap.id;

    const ownerRes = await request(app)
      .get(`${API}/${roadmapId}`)
      .set("Authorization", authHeader(owner.accessToken));
    assert.equal(ownerRes.status, 200);
    assert.equal(ownerRes.body.data.roadmap.id, roadmapId);
    assert.ok(ownerRes.body.data.roadmap.goals.length > 0);

    const strangerRes = await request(app)
      .get(`${API}/${roadmapId}`)
      .set("Authorization", authHeader(stranger.accessToken));
    assert.equal(strangerRes.status, 404);
    assert.equal(strangerRes.body.error.code, "ROADMAP_NOT_FOUND");
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get(`${API}/000000000000000000000000`);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});

describe("POST /api/v1/roadmap/regenerate", () => {
  it("returns 409 when no assessment exists", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .post(`${API}/regenerate`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "ROADMAP_ASSESSMENT_REQUIRED");
  });

  it("returns 409 when no active roadmap exists", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);

    const res = await request(app)
      .post(`${API}/regenerate`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "NO_ACTIVE_ROADMAP");
  });

  it("archives the previous roadmap and activates a new version", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    const first = await request(app)
      .post(`${API}/generate`)
      .set("Authorization", authHeader(accessToken));

    const res = await request(app)
      .post(`${API}/regenerate`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 201);
    const roadmap = res.body.data.roadmap;
    assert.equal(roadmap.version, 2);
    assert.equal(roadmap.status, "active");
    assert.equal(roadmap.reason, "MANUAL");
    assert.notEqual(roadmap.id, first.body.data.roadmap.id);

    const active = await request(app).get(API).set("Authorization", authHeader(accessToken));
    assert.equal(active.body.data.roadmap.id, roadmap.id);
    assert.equal(active.body.data.roadmap.version, 2);

    const archived = await request(app)
      .get(`${API}/${first.body.data.roadmap.id}`)
      .set("Authorization", authHeader(accessToken));
    assert.equal(archived.status, 200);
    assert.equal(archived.body.data.roadmap.status, "archived");
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).post(`${API}/regenerate`);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});

describe("GET /api/v1/roadmap/history", () => {
  it("returns an empty history before any roadmap exists", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .get(`${API}/history`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.history, []);
  });

  it("lists versions newest first", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    await request(app).post(`${API}/generate`).set("Authorization", authHeader(accessToken));
    await request(app).post(`${API}/regenerate`).set("Authorization", authHeader(accessToken));

    const res = await request(app)
      .get(`${API}/history`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const history = res.body.data.history;
    assert.equal(history.length, 2);
    assert.equal(history[0].version, 2);
    assert.equal(history[0].reason, "MANUAL");
    assert.equal(history[0].status, "active");
    assert.equal(history[1].version, 1);
    assert.equal(history[1].reason, "INITIAL");
    assert.equal(history[1].status, "archived");
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get(`${API}/history`);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});

describe("GET /api/v1/roadmap/compare", () => {
  it("rejects missing or invalid versions with 400", async () => {
    const { accessToken } = await register();
    const auth = authHeader(accessToken);

    const missing = await request(app).get(`${API}/compare`).set("Authorization", auth);
    assert.equal(missing.status, 400);
    assert.equal(missing.body.error.code, "INVALID_ROADMAP_VERSION");

    const badFrom = await request(app)
      .get(`${API}/compare?from=abc&to=2`)
      .set("Authorization", auth);
    assert.equal(badFrom.status, 400);
    assert.equal(badFrom.body.error.code, "INVALID_ROADMAP_VERSION");

    const badTo = await request(app)
      .get(`${API}/compare?from=1&to=0`)
      .set("Authorization", auth);
    assert.equal(badTo.status, 400);
    assert.equal(badTo.body.error.code, "INVALID_ROADMAP_VERSION");
  });

  it("returns 404 when a version does not exist", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    await request(app).post(`${API}/generate`).set("Authorization", authHeader(accessToken));

    const res = await request(app)
      .get(`${API}/compare?from=1&to=99`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, "ROADMAP_NOT_FOUND");
  });

  it("diffs two versions by goal template keys", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    await request(app).post(`${API}/generate`).set("Authorization", authHeader(accessToken));
    await request(app).post(`${API}/regenerate`).set("Authorization", authHeader(accessToken));

    const res = await request(app)
      .get(`${API}/compare?from=1&to=2`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const diff = res.body.data.diff;
    assert.equal(diff.fromVersion, 1);
    assert.equal(diff.toVersion, 2);
    assert.equal(diff.phaseStructureChanged, false);
    assert.ok(Array.isArray(diff.addedGoals));
    assert.ok(Array.isArray(diff.removedGoals));
    assert.ok(Array.isArray(diff.unchangedGoals));
    assert.ok(diff.unchangedGoals.length > 0, "expected persisted goals between versions");
  });

  it("reports added and removed goals when the target role changes", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken, { targetRole: "Backend Developer" });
    await request(app).post(`${API}/generate`).set("Authorization", authHeader(accessToken));

    await request(app)
      .patch(ASSESSMENT_API)
      .set("Authorization", authHeader(accessToken))
      .send({ targetRole: "Frontend Developer", technologyPreferences: ["MERN"] });

    await request(app)
      .post(`${API}/regenerate`)
      .set("Authorization", authHeader(accessToken));

    const res = await request(app)
      .get(`${API}/compare?from=1&to=2`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const diff = res.body.data.diff;
    assert.ok(diff.addedGoals.length > 0, "expected goals added after the role change");
    assert.ok(diff.removedGoals.length > 0, "expected goals removed after the role change");
    assert.equal(diff.phaseStructureChanged, false);
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get(`${API}/compare?from=1&to=2`);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});
