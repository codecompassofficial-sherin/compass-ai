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
const ROADMAP_API = "/api/v1/roadmap";
const GOALS_API = "/api/v1/goals";
const PROJECTS_API = "/api/v1/projects";
const API = "/api/v1/dashboard";

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

function projectBody(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    title: "MERN E-Commerce App",
    description: "A full stack storefront.",
    technologyStack: ["MongoDB", "Express", "React", "Node.js"],
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

async function createAssessment(accessToken: string) {
  const res = await request(app)
    .post(ASSESSMENT_API)
    .set("Authorization", authHeader(accessToken))
    .send(assessmentBody());
  assert.equal(res.status, 201);
}

async function generateRoadmap(accessToken: string) {
  const res = await request(app)
    .post(`${ROADMAP_API}/generate`)
    .set("Authorization", authHeader(accessToken));
  assert.equal(res.status, 201);
  return res.body.data.roadmap;
}

async function createProject(accessToken: string, overrides: Record<string, unknown> = {}) {
  const res = await request(app)
    .post(PROJECTS_API)
    .set("Authorization", authHeader(accessToken))
    .send(projectBody(overrides));
  assert.equal(res.status, 201);
  return res.body.data.project;
}

describe("GET /api/v1/dashboard", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get(API);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });

  it("returns sensible defaults for an empty account", async () => {
    const { accessToken } = await register();

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const dashboard = res.body.data.dashboard;
    assert.deepEqual(dashboard.profile, {
      targetRole: null,
      experienceLevel: null,
      primaryCareerGoal: null,
    });
    assert.equal(dashboard.roadmap, null);
    assert.deepEqual(dashboard.goals, { totalGoals: 0, draft: 0, active: 0, completed: 0, progress: 0 });
    assert.deepEqual(dashboard.projects, { totalProjects: 0, inProgress: 0, completed: 0, recent: [] });
    assert.equal(dashboard.statistics.totalGoals, 0);
    assert.equal(dashboard.statistics.completedGoals, 0);
    assert.equal(dashboard.statistics.activeGoals, 0);
    assert.equal(dashboard.statistics.totalProjects, 0);
    assert.equal(dashboard.statistics.completedProjects, 0);
    assert.equal(dashboard.statistics.roadmapProgress, 0);
    assert.equal(dashboard.statistics.currentPhase, null);
    assert.equal(dashboard.statistics.currentGoal, null);
    assert.equal(typeof dashboard.statistics.accountCreatedAt, "string");
  });

  it("reports a missing assessment with null profile fields", async () => {
    const { accessToken } = await register();

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.dashboard.profile, {
      targetRole: null,
      experienceLevel: null,
      primaryCareerGoal: null,
    });
  });

  it("reflects the assessment when present", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const dashboard = res.body.data.dashboard;
    assert.deepEqual(dashboard.profile, {
      targetRole: "Backend Developer",
      experienceLevel: "Beginner",
      primaryCareerGoal: "First Tech Role",
    });
    assert.equal(dashboard.roadmap, null);
  });

  it("aggregates a populated account into correct statistics", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    const roadmap = await generateRoadmap(accessToken);

    const firstGoal = roadmap.goals[0];
    await request(app)
      .post(`${GOALS_API}/${firstGoal.id}/activate`)
      .set("Authorization", authHeader(accessToken));

    const inProgress = await createProject(accessToken, { title: "Active Build" });
    await request(app)
      .patch(`${PROJECTS_API}/${inProgress.id}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "in_progress" });
    const done = await createProject(accessToken, { title: "Finished App" });
    await request(app)
      .patch(`${PROJECTS_API}/${done.id}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "in_progress" });
    await request(app)
      .post(`${PROJECTS_API}/${done.id}/complete`)
      .set("Authorization", authHeader(accessToken));

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const dashboard = res.body.data.dashboard;

    assert.equal(dashboard.profile.targetRole, "Backend Developer");
    assert.equal(dashboard.roadmap.active, true);
    assert.equal(dashboard.roadmap.version, roadmap.version);
    assert.equal(dashboard.roadmap.totalPhases, 4);
    assert.ok(dashboard.roadmap.completedPhases >= 0);
    assert.ok(dashboard.roadmap.progress >= 0);

    assert.equal(dashboard.goals.totalGoals, roadmap.goals.length);
    assert.equal(dashboard.goals.active, 1);
    assert.equal(
      dashboard.goals.totalGoals,
      dashboard.goals.draft + dashboard.goals.active + dashboard.goals.completed,
    );
    assert.ok(dashboard.goals.progress >= 0);

    assert.equal(dashboard.projects.totalProjects, 2);
    assert.equal(dashboard.projects.inProgress, 1);
    assert.equal(dashboard.projects.completed, 1);
    assert.equal(dashboard.projects.recent.length, 2);
    assert.equal(dashboard.projects.recent[0].title, "Finished App");

    const statistics = dashboard.statistics;
    assert.equal(statistics.totalGoals, roadmap.goals.length);
    assert.equal(statistics.activeGoals, 1);
    assert.equal(statistics.totalProjects, 2);
    assert.equal(statistics.completedProjects, 1);
    assert.equal(statistics.currentGoal, firstGoal.title);
    assert.equal(typeof statistics.currentPhase, "string");
    assert.equal(typeof statistics.accountCreatedAt, "string");
  });

  it("excludes archived projects from totals and recent projects", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    await generateRoadmap(accessToken);
    const keep = await createProject(accessToken, { title: "Keep" });
    const archive = await createProject(accessToken, { title: "Remove" });
    await request(app)
      .delete(`${PROJECTS_API}/${archive.id}`)
      .set("Authorization", authHeader(accessToken));

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const dashboard = res.body.data.dashboard;
    assert.equal(dashboard.projects.totalProjects, 1);
    assert.equal(dashboard.projects.recent.length, 1);
    assert.equal(dashboard.projects.recent[0].id, keep.id);
    assert.equal(dashboard.statistics.totalProjects, 1);
  });

  it("keeps dashboards isolated between users", async () => {
    const userA = await register();
    const userB = await register();
    await createAssessment(userA.accessToken);
    await generateRoadmap(userA.accessToken);
    await createProject(userA.accessToken, { title: "Private" });

    const resB = await request(app).get(API).set("Authorization", authHeader(userB.accessToken));

    assert.equal(resB.status, 200);
    const dashboardB = resB.body.data.dashboard;
    assert.deepEqual(dashboardB.profile, {
      targetRole: null,
      experienceLevel: null,
      primaryCareerGoal: null,
    });
    assert.equal(dashboardB.roadmap, null);
    assert.equal(dashboardB.goals.totalGoals, 0);
    assert.equal(dashboardB.projects.totalProjects, 0);
  });
});
