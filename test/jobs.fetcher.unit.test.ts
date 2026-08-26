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
});
