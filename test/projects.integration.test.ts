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
const API = "/api/v1/projects";

function registerBody(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    firstName: "Jane",
    lastName: "Doe",
    email: `jane.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`,
    password: "StrongPassword123!",
    ...overrides,
  };
}

function projectBody(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    title: "MERN E-Commerce App",
    description: "A full stack storefront with auth, catalog, and cart.",
    technologyStack: ["MongoDB", "Express", "React", "Node.js"],
    githubUrl: "https://github.com/janedoe/mern-store",
    liveUrl: "https://mern-store.example.com",
    relatedGoalIds: [],
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

async function createProject(accessToken: string, overrides: Record<string, unknown> = {}) {
  const res = await request(app)
    .post(API)
    .set("Authorization", authHeader(accessToken))
    .send(projectBody(overrides));
  assert.equal(res.status, 201);
  return res.body.data.project;
}

describe("POST /api/v1/projects", () => {
  it("creates a planned project for the authenticated user", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .post(API)
      .set("Authorization", authHeader(accessToken))
      .send(projectBody());

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    const project = res.body.data.project;
    assert.equal(typeof project.id, "string");
    assert.equal(project.title, "MERN E-Commerce App");
    assert.equal(project.status, "planned");
    assert.deepEqual(project.technologyStack, ["MongoDB", "Express", "React", "Node.js"]);
    assert.equal(project.githubUrl, "https://github.com/janedoe/mern-store");
    assert.equal(project.liveUrl, "https://mern-store.example.com");
    assert.deepEqual(project.relatedGoalIds, []);
    assert.equal(project.completedAt, undefined);
    assert.equal(typeof project.createdAt, "string");
    assert.equal(typeof project.updatedAt, "string");
  });

  it("rejects an empty title with 400 VALIDATION_ERROR", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .post(API)
      .set("Authorization", authHeader(accessToken))
      .send(projectBody({ title: "  " }));

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  });

  it("rejects invalid URLs with 400 VALIDATION_ERROR", async () => {
    const { accessToken } = await register();

    const badGithub = await request(app)
      .post(API)
      .set("Authorization", authHeader(accessToken))
      .send(projectBody({ githubUrl: "not-a-url" }));
    assert.equal(badGithub.status, 400);
    assert.equal(badGithub.body.error.code, "VALIDATION_ERROR");

    const badLive = await request(app)
      .post(API)
      .set("Authorization", authHeader(accessToken))
      .send(projectBody({ liveUrl: "https://" }));
    assert.equal(badLive.status, 400);
    assert.equal(badLive.body.error.code, "VALIDATION_ERROR");
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).post(API).send(projectBody());
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});

describe("GET /api/v1/projects", () => {
  it("returns an empty list before any project exists", async () => {
    const { accessToken } = await register();

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.projects, []);
  });

  it("lists the user's projects newest first", async () => {
    const { accessToken } = await register();
    await createProject(accessToken, { title: "First Project" });
    await createProject(accessToken, { title: "Second Project" });

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const projects = res.body.data.projects;
    assert.equal(projects.length, 2);
    assert.equal(projects[0].title, "Second Project");
    assert.equal(projects[1].title, "First Project");
  });

  it("excludes archived projects from the list", async () => {
    const { accessToken } = await register();
    const first = await createProject(accessToken, { title: "Keep Me" });
    const second = await createProject(accessToken, { title: "Archive Me" });
    await request(app)
      .delete(`${API}/${second.id}`)
      .set("Authorization", authHeader(accessToken));

    const res = await request(app).get(API).set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const projects = res.body.data.projects;
    assert.equal(projects.length, 1);
    assert.equal(projects[0].id, first.id);
  });

  it("keeps projects isolated between users", async () => {
    const userA = await register();
    const userB = await register();
    await createProject(userA.accessToken, { title: "Private Project" });

    const resB = await request(app).get(API).set("Authorization", authHeader(userB.accessToken));

    assert.equal(resB.status, 200);
    assert.deepEqual(resB.body.data.projects, []);
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get(API);
    assert.equal(res.status, 401);
    assert.equal(res.body.error.code, "INVALID_ACCESS_TOKEN");
  });
});

describe("GET /api/v1/projects/:id", () => {
  it("rejects an invalid project id with 400", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .get(`${API}/not-an-object-id`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "INVALID_PROJECT_ID");
  });

  it("returns 404 for a nonexistent project", async () => {
    const { accessToken } = await register();

    const res = await request(app)
      .get(`${API}/000000000000000000000000`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, "PROJECT_NOT_FOUND");
  });

  it("returns the project for its owner only", async () => {
    const owner = await register();
    const stranger = await register();
    const project = await createProject(owner.accessToken);

    const ownerRes = await request(app)
      .get(`${API}/${project.id}`)
      .set("Authorization", authHeader(owner.accessToken));
    assert.equal(ownerRes.status, 200);
    assert.equal(ownerRes.body.data.project.id, project.id);

    const strangerRes = await request(app)
      .get(`${API}/${project.id}`)
      .set("Authorization", authHeader(stranger.accessToken));
    assert.equal(strangerRes.status, 404);
    assert.equal(strangerRes.body.error.code, "PROJECT_NOT_FOUND");
  });
});

describe("PATCH /api/v1/projects/:id", () => {
  it("updates editable fields", async () => {
    const { accessToken } = await register();
    const project = await createProject(accessToken);

    const res = await request(app)
      .patch(`${API}/${project.id}`)
      .set("Authorization", authHeader(accessToken))
      .send({ title: "Renamed Store", description: "Updated description." });

    assert.equal(res.status, 200);
    const updated = res.body.data.project;
    assert.equal(updated.id, project.id);
    assert.equal(updated.title, "Renamed Store");
    assert.equal(updated.description, "Updated description.");
    assert.equal(updated.status, "planned");
  });

  it("moves a project to in_progress via status", async () => {
    const { accessToken } = await register();
    const project = await createProject(accessToken);

    const res = await request(app)
      .patch(`${API}/${project.id}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "in_progress" });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.project.status, "in_progress");
    assert.equal(res.body.data.project.completedAt, undefined);
  });

  it("rejects invalid status transitions with 409", async () => {
    const { accessToken } = await register();
    const project = await createProject(accessToken);

    const skip = await request(app)
      .patch(`${API}/${project.id}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "completed" });
    assert.equal(skip.status, 409);
    assert.equal(skip.body.error.code, "INVALID_PROJECT_STATUS_TRANSITION");

    const backward = await request(app)
      .patch(`${API}/${project.id}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "in_progress" });
    assert.equal(backward.status, 200);

    const rewind = await request(app)
      .patch(`${API}/${backward.body.data.project.id}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "planned" });
    assert.equal(rewind.status, 409);
    assert.equal(rewind.body.error.code, "INVALID_PROJECT_STATUS_TRANSITION");
  });

  it("rejects an empty payload with 400 VALIDATION_ERROR", async () => {
    const { accessToken } = await register();
    const project = await createProject(accessToken);

    const res = await request(app)
      .patch(`${API}/${project.id}`)
      .set("Authorization", authHeader(accessToken))
      .send({});

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  });

  it("rejects invalid URLs on update with 400 VALIDATION_ERROR", async () => {
    const { accessToken } = await register();
    const project = await createProject(accessToken);

    const res = await request(app)
      .patch(`${API}/${project.id}`)
      .set("Authorization", authHeader(accessToken))
      .send({ liveUrl: "definitely-not-a-url" });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  });
});

describe("POST /api/v1/projects/:id/complete", () => {
  it("rejects completing a planned project with 409", async () => {
    const { accessToken } = await register();
    const project = await createProject(accessToken);

    const res = await request(app)
      .post(`${API}/${project.id}/complete`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "PROJECT_CANNOT_COMPLETE");
  });

  it("completes an in-progress project and sets completedAt", async () => {
    const { accessToken } = await register();
    const project = await createProject(accessToken);
    await request(app)
      .patch(`${API}/${project.id}`)
      .set("Authorization", authHeader(accessToken))
      .send({ status: "in_progress" });

    const res = await request(app)
      .post(`${API}/${project.id}/complete`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    const completed = res.body.data.project;
    assert.equal(completed.status, "completed");
    assert.equal(typeof completed.completedAt, "string");

    const again = await request(app)
      .post(`${API}/${project.id}/complete`)
      .set("Authorization", authHeader(accessToken));
    assert.equal(again.status, 409);
    assert.equal(again.body.error.code, "PROJECT_CANNOT_COMPLETE");
  });
});

describe("DELETE /api/v1/projects/:id", () => {
  it("archives a project and removes it from the list", async () => {
    const { accessToken } = await register();
    const project = await createProject(accessToken);

    const res = await request(app)
      .delete(`${API}/${project.id}`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 200);
    assert.equal(res.body.data.project.status, "archived");

    const list = await request(app).get(API).set("Authorization", authHeader(accessToken));
    assert.deepEqual(list.body.data.projects, []);

    const get = await request(app)
      .get(`${API}/${project.id}`)
      .set("Authorization", authHeader(accessToken));
    assert.equal(get.status, 200);
    assert.equal(get.body.data.project.status, "archived");
  });

  it("rejects archiving an already archived project with 409", async () => {
    const { accessToken } = await register();
    const project = await createProject(accessToken);
    await request(app)
      .delete(`${API}/${project.id}`)
      .set("Authorization", authHeader(accessToken));

    const res = await request(app)
      .delete(`${API}/${project.id}`)
      .set("Authorization", authHeader(accessToken));

    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "PROJECT_CANNOT_ARCHIVE");
  });

  it("returns 404 when archiving another user's project", async () => {
    const owner = await register();
    const stranger = await register();
    const project = await createProject(owner.accessToken);

    const res = await request(app)
      .delete(`${API}/${project.id}`)
      .set("Authorization", authHeader(stranger.accessToken));

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, "PROJECT_NOT_FOUND");
  });
});
