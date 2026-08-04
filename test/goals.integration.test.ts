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
const API = "/api/v1/goals";

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

async function withRoadmap() {
  const { accessToken, userId } = await register();
  await createAssessment(accessToken);
  const generated = await request(app)
    .post(`${ROADMAP_API}/generate`)
    .set("Authorization", authHeader(accessToken));
  assert.equal(generated.status, 201);
  return { accessToken, userId, roadmap: generated.body.data.roadmap };
}

describe("GET /api/v1/goals", () => {
  it("returns 404 when no active roadmap exists", async () => {
    const { accessToken } = await register();

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, "NO_ACTIVE_ROADMAP");
  });

  it("lists roadmap goals in order with draft status and zero progress", async () => {
    const { accessToken, roadmap } = await withRoadmap();

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const goals = res.body.data.goals;
    assert.equal(goals.length, roadmap.goals.length);
    for (let index = 0; index < goals.length; index += 1) {
      const goal = goals[index];
      assert.equal(goal.id, roadmap.goals[index].id);
      assert.equal(goal.status, "draft");
      assert.equal(goal.progress, 0);
      assert.equal(goal.taskCount, 0);
      assert.deepEqual(goal.tasks, []);
    }
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get(API);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});

describe("POST /api/v1/goals/:id/activate", () => {
  it("rejects an invalid goal id with 400", async () => {
    const { accessToken } = await withRoadmap();

    const res = await request(app)
      .post(`${API}/not-an-object-id/activate`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "INVALID_GOAL_ID");
  });

  it("returns 404 for a goal that does not exist", async () => {
    const { accessToken } = await withRoadmap();

    const res = await request(app)
      .post(`${API}/000000000000000000000000/activate`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, "GOAL_NOT_FOUND");
  });

  it("materializes tasks once and marks the goal active", async () => {
    const { accessToken, roadmap } = await withRoadmap();
    const goalId = roadmap.goals[0].id;

    const res = await request(app)
      .post(`${API}/${goalId}/activate`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const goal = res.body.data.goal;
    assert.equal(goal.id, goalId);
    assert.equal(goal.status, "active");
    assert.equal(typeof goal.activatedAt, "string");
    assert.equal(goal.progress, 0);
    assert.ok(goal.tasks.length > 0, "expected generated tasks");
    assert.equal(goal.taskCount, goal.tasks.length);
    assert.equal(goal.tasks[0].order, 1);
    assert.equal(goal.tasks[0].status, "todo");
    assert.equal(goal.tasks[0].goalId, goalId);
    assert.equal(goal.tasks[0].roadmapId, roadmap.id);
    assert.equal(typeof goal.tasks[0].templateVersion, "string");
    assert.ok(goal.tasks[0].estimatedEffortHours > 0);

    const totalEffort = goal.tasks.reduce(
      (sum: number, task: { estimatedEffortHours: number }) => sum + task.estimatedEffortHours,
      0,
    );
    assert.equal(totalEffort, goal.estimatedEffortHours);
  });

  it("is idempotent and does not duplicate tasks on re-activation", async () => {
    const { accessToken, roadmap } = await withRoadmap();
    const goalId = roadmap.goals[0].id;

    const first = await request(app)
      .post(`${API}/${goalId}/activate`)
      .set("Authorization", authHeader(accessToken));
    const second = await request(app)
      .post(`${API}/${goalId}/activate`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(second.body.data.goal.status, "active");
    assert.equal(first.body.data.goal.tasks.length, second.body.data.goal.tasks.length);
    assert.deepEqual(
      second.body.data.goal.tasks.map((task: { id: string }) => task.id),
      first.body.data.goal.tasks.map((task: { id: string }) => task.id),
    );
  });
});

describe("POST /api/v1/goals/:id/complete", () => {
  it("rejects completing a draft goal with 409", async () => {
    const { accessToken, roadmap } = await withRoadmap();
    const goalId = roadmap.goals[0].id;

    const res = await request(app)
      .post(`${API}/${goalId}/complete`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "GOAL_NOT_ACTIVE");
  });

  it("completes an active goal and records the timestamp", async () => {
    const { accessToken, roadmap } = await withRoadmap();
    const goalId = roadmap.goals[0].id;

    await request(app)
      .post(`${API}/${goalId}/activate`)
      .set("Authorization", authHeader(accessToken));

    const res = await request(app)
      .post(`${API}/${goalId}/complete`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const goal = res.body.data.goal;
    assert.equal(goal.id, goalId);
    assert.equal(goal.status, "completed");
    assert.equal(typeof goal.completedAt, "string");

    const again = await request(app)
      .post(`${API}/${goalId}/complete`)
      .set("Authorization", authHeader(accessToken));
    assert.equal(again.status, 200);
    assert.equal(again.body.data.goal.status, "completed");
  });
});

describe("GET /api/v1/goals/:id", () => {
  it("returns a single goal with its tasks", async () => {
    const { accessToken, roadmap } = await withRoadmap();
    const goalId = roadmap.goals[0].id;
    await request(app)
      .post(`${API}/${goalId}/activate`)
      .set("Authorization", authHeader(accessToken));

    const res = await request(app)
      .get(`${API}/${goalId}`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const goal = res.body.data.goal;
    assert.equal(goal.id, goalId);
    assert.equal(goal.status, "active");
    assert.equal(goal.taskCount, goal.tasks.length);
    assert.ok(goal.tasks.length > 0);
  });

  it("returns 404 for a goal owned by another user", async () => {
    const { roadmap } = await withRoadmap();
    const stranger = await register();

    const res = await request(app)
      .get(`${API}/${roadmap.goals[0].id}`)
      .set("Authorization", authHeader(stranger.accessToken));

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, "NO_ACTIVE_ROADMAP");
  });
});

describe("PATCH /api/v1/goals/:goalId/tasks/:taskId", () => {
  async function withActivatedGoal() {
    const { accessToken, roadmap } = await withRoadmap();
    const goalId = roadmap.goals[0].id;
    const activated = await request(app)
      .post(`${API}/${goalId}/activate`)
      .set("Authorization", authHeader(accessToken));
    assert.equal(activated.status, 200);
    const taskId = activated.body.data.goal.tasks[0].id;
    return { accessToken, goalId, taskId };
  }

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app)
      .patch(`${API}/goal-1/tasks/task-1`)
      .send({ status: "in_progress" });

    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });

  it("rejects an invalid goal id with 400", async () => {
    const { accessToken, taskId } = await withActivatedGoal();

    const res = await request(app)
      .patch(`${API}/not-an-object-id/tasks/${taskId}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "in_progress" });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "INVALID_GOAL_ID");
  });

  it("rejects an invalid task id with 400", async () => {
    const { accessToken, goalId } = await withActivatedGoal();

    const res = await request(app)
      .patch(`${API}/${goalId}/tasks/not-an-object-id`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "in_progress" });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "INVALID_TASK_ID");
  });

  it("returns 404 for a task that does not exist", async () => {
    const { accessToken, goalId } = await withActivatedGoal();

    const res = await request(app)
      .patch(`${API}/${goalId}/tasks/000000000000000000000000`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "in_progress" });

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, "TASK_NOT_FOUND");
  });

  it("rejects an invalid status value with 400", async () => {
    const { accessToken, goalId, taskId } = await withActivatedGoal();

    const res = await request(app)
      .patch(`${API}/${goalId}/tasks/${taskId}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "shipped" });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  });

  it("moves a task from todo to in_progress", async () => {
    const { accessToken, goalId, taskId } = await withActivatedGoal();

    const res = await request(app)
      .patch(`${API}/${goalId}/tasks/${taskId}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "in_progress" });

    assert.equal(res.status, 200);
    const goal = res.body.data.goal;
    const task = goal.tasks.find((task: { id: string }) => task.id === taskId);
    assert.equal(task.status, "in_progress");
    assert.equal(goal.progress, 0);
  });

  it("moves a task from in_progress to done and increases goal progress", async () => {
    const { accessToken, goalId, taskId } = await withActivatedGoal();

    await request(app)
      .patch(`${API}/${goalId}/tasks/${taskId}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "in_progress" });

    const res = await request(app)
      .patch(`${API}/${goalId}/tasks/${taskId}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "done" });

    assert.equal(res.status, 200);
    const goal = res.body.data.goal;
    const task = goal.tasks.find((task: { id: string }) => task.id === taskId);
    assert.equal(task.status, "done");
    const doneCount = goal.tasks.filter(
      (task: { status: string }) => task.status === "done",
    ).length;
    assert.equal(goal.progress, Math.round((doneCount / goal.tasks.length) * 100));
    assert.ok(goal.progress > 0, "goal progress should increase when a task is done");
  });

  it("rejects skipping a state from todo to done", async () => {
    const { accessToken, goalId, taskId } = await withActivatedGoal();

    const res = await request(app)
      .patch(`${API}/${goalId}/tasks/${taskId}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "done" });

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "INVALID_TASK_STATUS_TRANSITION");
  });

  it("rejects moving a done task backwards", async () => {
    const { accessToken, goalId, taskId } = await withActivatedGoal();

    await request(app)
      .patch(`${API}/${goalId}/tasks/${taskId}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "in_progress" });
    await request(app)
      .patch(`${API}/${goalId}/tasks/${taskId}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "done" });

    const res = await request(app)
      .patch(`${API}/${goalId}/tasks/${taskId}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "todo" });

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "INVALID_TASK_STATUS_TRANSITION");
  });
});
