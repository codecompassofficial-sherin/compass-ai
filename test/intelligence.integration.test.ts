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
const API = "/api/v1/intelligence";

function registerBody(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    firstName: "Ada",
    lastName: "Lovelace",
    email: `ada.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`,
    password: "StrongPassword123!",
    ...overrides,
  };
}

function assessmentBody(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    targetRole: "Backend Developer",
    experienceLevel: "Beginner",
    technologyPreferences: ["MERN"],
    currentSkills: ["JavaScript"],
    primaryCareerGoal: "First Tech Role",
    targetTimeline: "6 Months",
    ...overrides,
  };
}

function projectBody(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    title: "REST API Service",
    description: "A production-style REST API.",
    technologyStack: ["Node.js", "Express"],
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

async function createAssessment(accessToken: string, overrides: Partial<Record<string, unknown>> = {}) {
  const res = await request(app)
    .post(ASSESSMENT_API)
    .set("Authorization", authHeader(accessToken))
    .send(assessmentBody(overrides));
  assert.equal(res.status, 201);
}

async function generateRoadmap(accessToken: string) {
  const res = await request(app)
    .post(`${ROADMAP_API}/generate`)
    .set("Authorization", authHeader(accessToken));
  assert.equal(res.status, 201);
  return res.body.data.roadmap;
}

async function listGoals(accessToken: string) {
  const res = await request(app).get(GOALS_API).set("Authorization", authHeader(accessToken));
  assert.equal(res.status, 200);
  return res.body.data.goals;
}

async function activateGoal(accessToken: string, goalId: string) {
  const res = await request(app)
    .post(`${GOALS_API}/${goalId}/activate`)
    .set("Authorization", authHeader(accessToken));
  assert.equal(res.status, 200);
}

async function completeGoal(accessToken: string, goalId: string) {
  const res = await request(app)
    .post(`${GOALS_API}/${goalId}/complete`)
    .set("Authorization", authHeader(accessToken));
  assert.equal(res.status, 200);
}

async function createProject(accessToken: string, overrides: Record<string, unknown> = {}) {
  const res = await request(app)
    .post(PROJECTS_API)
    .set("Authorization", authHeader(accessToken))
    .send(projectBody(overrides));
  assert.equal(res.status, 201);
  return res.body.data.project;
}

describe("GET /api/v1/intelligence", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get(API);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });

  it("returns empty defaults for a fresh account", async () => {
    const { accessToken } = await register();

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const data = res.body.data;
    assert.equal(data.nextBestAction.action, "COMPLETE_ASSESSMENT");
    assert.deepEqual(data.skillGap, { acquiredSkills: [], missingSkills: [], recommendedSkills: [] });
    assert.deepEqual(data.learning, []);
    assert.deepEqual(data.projects, []);
    assert.equal(data.roadmap.overallProgress, 0);
    assert.equal(data.roadmap.totalGoals, 0);
    assert.equal(data.roadmap.currentPhase, null);
    assert.equal(data.roadmap.currentGoal, null);
    assert.equal(typeof data.roadmap.readinessSummary, "string");
  });

  it("recommends completing the assessment when none exists", async () => {
    const { accessToken } = await register();

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.data.nextBestAction.action, "COMPLETE_ASSESSMENT");
    assert.deepEqual(res.body.data.projects, []);
  });

  it("recommends generating a roadmap when the assessment exists", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.data.nextBestAction.action, "GENERATE_ROADMAP");
    assert.deepEqual(res.body.data.skillGap.missingSkills, []);
    assert.deepEqual(res.body.data.learning, []);
    assert.deepEqual(res.body.data.projects, []);
  });

  it("recommends activating a draft goal and surfaces skill gaps and project ideas", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    const roadmap = await generateRoadmap(accessToken);
    const goals = await listGoals(accessToken);

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const data = res.body.data;

    assert.equal(data.nextBestAction.action, "ACTIVATE_GOAL");
    assert.equal(data.nextBestAction.goalId, goals[0].id);

    assert.deepEqual(data.skillGap.acquiredSkills, ["JavaScript"]);
    assert.ok(data.skillGap.missingSkills.length > 0);
    assert.ok(data.learning.length > 0);
    assert.equal(data.learning[0].priority, "high");

    assert.ok(data.projects.length > 0);
    assert.equal(data.projects[0].templateKey, "rest-api-service");

    assert.equal(data.roadmap.overallProgress, 0);
    assert.equal(data.roadmap.totalGoals, roadmap.goals.length);
    assert.equal(data.roadmap.remainingGoals, roadmap.goals.length);
    assert.equal(data.roadmap.completedGoals, 0);
    assert.equal(data.roadmap.currentGoal, goals[0].id);
  });

  it("recommends continuing a goal when every goal is active", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    await generateRoadmap(accessToken);
    const goals = await listGoals(accessToken);
    for (const goal of goals) {
      await activateGoal(accessToken, goal.id);
    }

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.data.nextBestAction.action, "CONTINUE_GOAL");
    assert.equal(res.body.data.nextBestAction.goalId, goals[0].id);
  });

  it("recommends starting a project once the roadmap is completed", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    await generateRoadmap(accessToken);
    const goals = await listGoals(accessToken);
    for (const goal of goals) {
      await activateGoal(accessToken, goal.id);
    }
    for (const goal of goals) {
      await completeGoal(accessToken, goal.id);
    }

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const data = res.body.data;
    assert.equal(data.nextBestAction.action, "START_PROJECT");
    assert.equal(data.nextBestAction.projectTemplateKey, "rest-api-service");
    assert.equal(data.roadmap.overallProgress, 100);
    assert.equal(data.roadmap.remainingGoals, 0);
    assert.equal(data.roadmap.completedGoals, goals.length);
    assert.equal(data.roadmap.currentPhase, null);
    assert.equal(data.roadmap.currentGoal, null);
    assert.match(data.roadmap.readinessSummary, /ready for the next step/);
  });

  it("recommends regenerating the roadmap once goals are done and a project is in progress", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    await generateRoadmap(accessToken);
    const goals = await listGoals(accessToken);
    for (const goal of goals) {
      await activateGoal(accessToken, goal.id);
    }
    for (const goal of goals) {
      await completeGoal(accessToken, goal.id);
    }
    const project = await createProject(accessToken, { title: "Active Build" });
    await request(app)
      .patch(`${PROJECTS_API}/${project.id}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "in_progress" });

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.data.nextBestAction.action, "REGENERATE_ROADMAP");
  });

  it("tracks skills gained from completed goals in the gap analysis", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    await generateRoadmap(accessToken);
    const goals = await listGoals(accessToken);
    const first = goals[0];
    await activateGoal(accessToken, first.id);
    await completeGoal(accessToken, first.id);

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const gap = res.body.data.skillGap;
    assert.ok(gap.acquiredSkills.includes("JavaScript"));
    for (const skill of first.skillTargets) {
      assert.ok(gap.acquiredSkills.includes(skill), `expected ${skill} to be acquired`);
      assert.ok(!gap.missingSkills.includes(skill), `expected ${skill} to not be missing`);
    }
  });

  it("excludes project templates the user has already started", async () => {
    const { accessToken } = await register();
    await createAssessment(accessToken);
    await generateRoadmap(accessToken);
    await createProject(accessToken, { title: "REST API Service" });

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const projects = res.body.data.projects;
    assert.ok(projects.length > 0);
    assert.ok(
      !projects.some((entry: { templateKey: string }) => entry.templateKey === "rest-api-service"),
    );
  });

  it("keeps intelligence isolated between users", async () => {
    const userA = await register();
    const userB = await register();
    await createAssessment(userA.accessToken);
    await generateRoadmap(userA.accessToken);

    const resB = await request(app).get(API).set("Authorization", authHeader(userB.accessToken));

    assert.equal(resB.status, 200);
    assert.equal(resB.body.data.nextBestAction.action, "COMPLETE_ASSESSMENT");
    assert.deepEqual(resB.body.data.skillGap, { acquiredSkills: [], missingSkills: [], recommendedSkills: [] });
    assert.deepEqual(resB.body.data.learning, []);
    assert.deepEqual(resB.body.data.projects, []);
  });
});
