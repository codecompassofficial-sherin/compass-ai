import assert from "node:assert/strict";
import { describe, it, mock, beforeEach } from "node:test";
import type { RawJobResult } from "../src/modules/jobs/sources/job-source.interface.js";

function makeRaw(overrides: Partial<RawJobResult> = {}): RawJobResult {
  return {
    sourceId: "src-001",
    title: "Software Engineer",
    company: "Acme Corp",
    description: "Build things",
    isRemote: false,
    url: "https://example.com/job/1",
    skills: ["JavaScript"],
    tags: ["engineering"],
    ...overrides,
  };
}

function mockDocument(source: string, sourceId: string, update: Record<string, unknown>) {
  return { _id: "mock-doc-id", source, sourceId, ...update };
}

const adzunaSearch = mock.fn(async () => [] as RawJobResult[]);
const joobleSearch = mock.fn(async () => [] as RawJobResult[]);

const upsertCalls: Array<{ source: string; sourceId: string; update: Record<string, unknown> }> = [];
const mockFindActiveJobs = mock.fn(async () => ({ jobs: [], total: 0 }));
const mockUpsertBySourceAndId = mock.fn(async (source: string, sourceId: string, update: Record<string, unknown>) => {
  upsertCalls.push({ source, sourceId, update });
  return mockDocument(source, sourceId, update);
});

const loggerWarn = mock.fn();
const loggerError = mock.fn();

mock.module("../src/shared/logger/logger.js", {
  namedExports: {
    logger: {
      warn: loggerWarn,
      error: loggerError,
    },
    httpLogger: () => undefined,
  },
});

mock.module("../src/modules/jobs/job.repository.js", {
  namedExports: {
    jobRepository: {
      findActiveJobs: mockFindActiveJobs,
      findBySourceAndId: mock.fn(async () => null),
      upsertBySourceAndId: mockUpsertBySourceAndId,
    },
  },
});

mock.module("../src/modules/jobs/sources/adzuna.adapter.js", {
  namedExports: {
    createAdzunaAdapter: () => ({
      sourceName: "adzuna" as const,
      search: adzunaSearch,
    }),
  },
});

mock.module("../src/modules/jobs/sources/jooble.adapter.js", {
  namedExports: {
    createJoobleAdapter: () => ({
      sourceName: "jooble" as const,
      search: joobleSearch,
    }),
  },
});

const { fetchJobs } = await import("../src/modules/jobs/job.fetcher.js");

describe("job fetcher", () => {
  beforeEach(() => {
    adzunaSearch.mock.resetCalls();
    joobleSearch.mock.resetCalls();
    mockFindActiveJobs.mock.resetCalls();
    mockUpsertBySourceAndId.mock.resetCalls();
    loggerWarn.mock.resetCalls();
    loggerError.mock.resetCalls();
    upsertCalls.length = 0;
    adzunaSearch.mock.mockImplementation(async () => []);
    joobleSearch.mock.mockImplementation(async () => []);
    mockFindActiveJobs.mock.mockImplementation(async () => ({ jobs: [], total: 0 }));
    mockUpsertBySourceAndId.mock.mockImplementation(async (source: string, sourceId: string, update: Record<string, unknown>) => {
      upsertCalls.push({ source, sourceId, update });
      return mockDocument(source, sourceId, update);
    });
  });

  it("returns empty results when no adapters produce results", async () => {
    const result = await fetchJobs({ keywords: "javascript" });
    assert.deepEqual(result.jobs, []);
    assert.equal(result.total, 0);
    assert.equal(result.page, 1);
  });

  it("returns page number from params", async () => {
    const result = await fetchJobs({ keywords: "javascript", page: 3 });
    assert.equal(result.page, 3);
  });

  it("fetches, normalizes, upserts, and returns jobs from a single source", async () => {
    adzunaSearch.mock.mockImplementation(async () => [
      makeRaw({ sourceId: "adz-1", title: "React Developer", company: "TechCo" }),
    ]);

    const result = await fetchJobs({ keywords: "react", sources: ["adzuna"] });

    assert.equal(result.jobs.length, 1);
    assert.equal(result.jobs[0]!.title, "React Developer");
    assert.equal(result.jobs[0]!.company, "TechCo");
    assert.equal(result.jobs[0]!.source, "adzuna");
    assert.equal(result.jobs[0]!.sourceId, "adz-1");

    assert.equal(upsertCalls.length, 1);
    assert.equal(upsertCalls[0]!.source, "adzuna");
    assert.equal(upsertCalls[0]!.sourceId, "adz-1");
  });

  it("deduplicates jobs with the same hash within a single source", async () => {
    adzunaSearch.mock.mockImplementation(async () => [
      makeRaw({ sourceId: "a-1", title: "Engineer", company: "SameCo" }),
      makeRaw({ sourceId: "a-2", title: "Engineer", company: "SameCo" }),
    ]);

    const result = await fetchJobs({ keywords: "engineer", sources: ["adzuna"] });

    assert.equal(result.jobs.length, 1);
    assert.equal(upsertCalls.length, 1);
  });

  it("does not deduplicate jobs from different sources", async () => {
    adzunaSearch.mock.mockImplementation(async () => [
      makeRaw({ sourceId: "a-1", title: "Engineer", company: "Acme" }),
    ]);
    joobleSearch.mock.mockImplementation(async () => [
      makeRaw({ sourceId: "j-1", title: "Engineer", company: "Acme" }),
    ]);

    const result = await fetchJobs({ keywords: "engineer" });

    assert.equal(result.jobs.length, 2);
    assert.equal(upsertCalls.length, 2);
  });

  it("returns results from successful source when another source throws", async () => {
    adzunaSearch.mock.mockImplementation(async () => {
      throw new Error("network failure");
    });
    joobleSearch.mock.mockImplementation(async () => [
      makeRaw({ sourceId: "j-1", title: "Backend Dev", company: "JoobleCo" }),
    ]);

    const result = await fetchJobs({ keywords: "backend" });

    assert.equal(result.jobs.length, 1);
    assert.equal(result.jobs[0]!.source, "jooble");
    assert.equal(result.jobs[0]!.title, "Backend Dev");
  });

  it("filters adapters by source param", async () => {
    adzunaSearch.mock.mockImplementation(async () => [
      makeRaw({ sourceId: "a-1", title: "Dev", company: "Acme" }),
    ]);
    joobleSearch.mock.mockImplementation(async () => [
      makeRaw({ sourceId: "j-1", title: "Dev", company: "Jooble" }),
    ]);

    await fetchJobs({ keywords: "dev", sources: ["adzuna"] });

    assert.equal(adzunaSearch.mock.callCount(), 1);
    assert.equal(joobleSearch.mock.callCount(), 0);
  });

  it("returns non-zero total from repository", async () => {
    mockFindActiveJobs.mock.mockImplementation(async () => ({
      jobs: [],
      total: 42,
    }));

    const result = await fetchJobs({ keywords: "test" });

    assert.equal(result.total, 42);
  });

  it("passes page and limit to adapter search params", async () => {
    const searchCalls: Array<{ keywords: string; page?: number; limit?: number }> = [];
    adzunaSearch.mock.mockImplementation(async (...args: unknown[]) => {
      const params = args[0] as { keywords: string; page?: number; limit?: number };
      searchCalls.push(params);
      return [];
    });

    await fetchJobs({ keywords: "query", page: 5, limit: 10 });

    assert.equal(adzunaSearch.mock.callCount(), 1);
    assert.equal(searchCalls[0]!.page, 5);
    assert.equal(searchCalls[0]!.limit, 10);
  });

  it("excludes jobs where repository upsert throws", async () => {
    let callCount = 0;
    adzunaSearch.mock.mockImplementation(async () => [
      makeRaw({ sourceId: "a-1", title: "Job A", company: "CoA" }),
      makeRaw({ sourceId: "a-2", title: "Job B", company: "CoB" }),
    ]);
    mockUpsertBySourceAndId.mock.mockImplementation(async (source: string, sourceId: string, update: Record<string, unknown>) => {
      callCount++;
      if (callCount === 1) throw new Error("db failure");
      upsertCalls.push({ source, sourceId, update });
      return mockDocument(source, sourceId, update);
    });

    const result = await fetchJobs({ keywords: "jobs", sources: ["adzuna"] });

    assert.equal(result.jobs.length, 1);
    assert.equal(result.jobs[0]!.title, "Job B");
  });

  it("logs a provider failure with source and operation while returning other providers' results", async () => {
    adzunaSearch.mock.mockImplementation(async () => {
      throw new Error("network failure");
    });
    joobleSearch.mock.mockImplementation(async () => [
      makeRaw({ sourceId: "j-1", title: "Backend Dev", company: "JoobleCo" }),
    ]);

    const result = await fetchJobs({ keywords: "backend", page: 2 });

    assert.equal(result.jobs.length, 1);
    assert.equal(result.jobs[0]!.source, "jooble");
    assert.equal(loggerWarn.mock.callCount(), 1);

    const [fields, message] = loggerWarn.mock.calls[0]!.arguments as [Record<string, unknown>, string];
    assert.equal(fields.source, "adzuna");
    assert.equal(fields.operation, "fetch");
    assert.equal(fields.error, "network failure");
    assert.equal(fields.keywords, "backend");
    assert.equal(fields.page, 2);
    assert.equal(message, "Job provider failed; skipping source");
  });

  it("logs a database upsert failure at error level", async () => {
    adzunaSearch.mock.mockImplementation(async () => [
      makeRaw({ sourceId: "a-1", title: "Job A", company: "CoA" }),
    ]);
    mockUpsertBySourceAndId.mock.mockImplementation(async () => {
      throw new Error("db write failed");
    });

    const result = await fetchJobs({ keywords: "jobs", sources: ["adzuna"], page: 3 });

    assert.equal(result.jobs.length, 0);
    assert.equal(loggerError.mock.callCount(), 1);

    const [fields, message] = loggerError.mock.calls[0]!.arguments as [Record<string, unknown>, string];
    assert.equal(fields.source, "adzuna");
    assert.equal(fields.operation, "upsert");
    assert.equal(fields.error, "db write failed");
    assert.equal(fields.keywords, "jobs");
    assert.equal(fields.page, 3);
    assert.equal(message, "Job upsert failed; skipping job");
  });

  it("redacts API keys, app IDs, and full URLs from logged errors", async () => {
    const appId = "test-adzuna-app-id-0001";
    const appKey = "test-adzuna-app-key-0002";
    const joobleKey = "test-jooble-api-key-0003";
    const previous = {
      appId: process.env.ADZUNA_APP_ID,
      appKey: process.env.ADZUNA_APP_KEY,
      joobleKey: process.env.JOOBLE_API_KEY,
    };
    process.env.ADZUNA_APP_ID = appId;
    process.env.ADZUNA_APP_KEY = appKey;
    process.env.JOOBLE_API_KEY = joobleKey;

    try {
      adzunaSearch.mock.mockImplementation(async () => {
        throw new Error(
          `request failed: https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${appId}&app_key=${appKey}`,
        );
      });
      joobleSearch.mock.mockImplementation(async () => {
        throw new Error(`invalid credentials ${joobleKey}`);
      });

      await fetchJobs({ keywords: "secret query" });

      adzunaSearch.mock.mockImplementation(async () => [
        makeRaw({ sourceId: "a-1", title: "Job A", company: "CoA" }),
      ]);
      joobleSearch.mock.mockImplementation(async () => []);
      mockUpsertBySourceAndId.mock.mockImplementation(async () => {
        throw new Error(`upsert rejected app_key=${appKey}`);
      });

      await fetchJobs({ keywords: "secret query" });
    } finally {
      if (previous.appId === undefined) delete process.env.ADZUNA_APP_ID;
      else process.env.ADZUNA_APP_ID = previous.appId;
      if (previous.appKey === undefined) delete process.env.ADZUNA_APP_KEY;
      else process.env.ADZUNA_APP_KEY = previous.appKey;
      if (previous.joobleKey === undefined) delete process.env.JOOBLE_API_KEY;
      else process.env.JOOBLE_API_KEY = previous.joobleKey;
    }

    const logged = JSON.stringify([...loggerWarn.mock.calls, ...loggerError.mock.calls]);
    assert.equal(logged.includes(appId), false);
    assert.equal(logged.includes(appKey), false);
    assert.equal(logged.includes(joobleKey), false);
    assert.equal(logged.includes("https://api.adzuna.com"), false);
    assert.equal(logged.includes("[redacted]"), true);
    assert.equal(loggerWarn.mock.callCount(), 2);
    assert.equal(loggerError.mock.callCount(), 1);
  });
});
