import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { jobNormalizer } from "../src/modules/jobs/job.normalizer.js";
import type { RawJobResult } from "../src/modules/jobs/sources/job-source.interface.js";

function makeRaw(overrides: Partial<RawJobResult> = {}): RawJobResult {
  return {
    sourceId: "test-123",
    title: "Software Engineer",
    company: "Acme Corp",
    description: "Build great things",
    isRemote: false,
    url: "https://example.com/job/123",
    skills: ["JavaScript"],
    tags: ["engineering"],
    ...overrides,
  };
}

describe("job normalizer", () => {
  describe("hash determinism", () => {
    it("produces identical hashes for identical inputs", () => {
      const a = jobNormalizer.normalizeJobResult(makeRaw(), "adzuna");
      const b = jobNormalizer.normalizeJobResult(makeRaw(), "adzuna");
      assert.equal(a.normalizedHash, b.normalizedHash);
    });

    it("produces different hashes when title changes", () => {
      const a = jobNormalizer.normalizeJobResult(makeRaw({ title: "Engineer" }), "adzuna");
      const b = jobNormalizer.normalizeJobResult(makeRaw({ title: "Designer" }), "adzuna");
      assert.notEqual(a.normalizedHash, b.normalizedHash);
    });

    it("produces different hashes when company changes", () => {
      const a = jobNormalizer.normalizeJobResult(makeRaw({ company: "Acme" }), "adzuna");
      const b = jobNormalizer.normalizeJobResult(makeRaw({ company: "Globex" }), "adzuna");
      assert.notEqual(a.normalizedHash, b.normalizedHash);
    });

    it("produces different hashes when source changes", () => {
      const a = jobNormalizer.normalizeJobResult(makeRaw(), "adzuna");
      const b = jobNormalizer.normalizeJobResult(makeRaw(), "jooble");
      assert.notEqual(a.normalizedHash, b.normalizedHash);
    });

    it("is case-insensitive for title and company", () => {
      const a = jobNormalizer.normalizeJobResult(makeRaw({ title: "Software Engineer", company: "Acme" }), "adzuna");
      const b = jobNormalizer.normalizeJobResult(makeRaw({ title: "software engineer", company: "acme" }), "adzuna");
      assert.equal(a.normalizedHash, b.normalizedHash);
    });

    it("generateNormalizedHash matches normalizeJobResult hash", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw(), "adzuna");
      const hash = jobNormalizer.generateNormalizedHash("adzuna", "Software Engineer", "Acme Corp");
      assert.equal(job.normalizedHash, hash);
    });
  });

  describe("text normalization", () => {
    it("trims whitespace from title and company", () => {
      const job = jobNormalizer.normalizeJobResult(
        makeRaw({ title: "  Software Engineer  ", company: "  Acme Corp  " }),
        "adzuna",
      );
      assert.equal(job.title, "Software Engineer");
      assert.equal(job.company, "Acme Corp");
    });
  });

  describe("employment type mapping", () => {
    it("maps full_time correctly", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ employmentType: "full_time" }), "adzuna");
      assert.equal(job.employmentType, "full_time");
    });

    it("maps full-time (hyphenated) correctly", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ employmentType: "full-time" }), "adzuna");
      assert.equal(job.employmentType, "full_time");
    });

    it("maps part_time correctly", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ employmentType: "part_time" }), "adzuna");
      assert.equal(job.employmentType, "part_time");
    });

    it("maps contract correctly", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ employmentType: "contract" }), "adzuna");
      assert.equal(job.employmentType, "contract");
    });

    it("maps internship correctly", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ employmentType: "internship" }), "adzuna");
      assert.equal(job.employmentType, "internship");
    });

    it("returns undefined for unknown employment type", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ employmentType: "something-else" }), "adzuna");
      assert.equal(job.employmentType, undefined);
    });

    it("returns undefined for missing employment type", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ employmentType: undefined }), "adzuna");
      assert.equal(job.employmentType, undefined);
    });
  });

  describe("salary normalization", () => {
    it("passes through valid salary values", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ salaryMin: 50000, salaryMax: 80000 }), "adzuna");
      assert.equal(job.salaryMin, 50000);
      assert.equal(job.salaryMax, 80000);
    });

    it("swaps min/max when inverted", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ salaryMin: 80000, salaryMax: 50000 }), "adzuna");
      assert.equal(job.salaryMin, 50000);
      assert.equal(job.salaryMax, 80000);
    });

    it("handles NaN salary values", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ salaryMin: NaN, salaryMax: NaN }), "adzuna");
      assert.equal(job.salaryMin, undefined);
      assert.equal(job.salaryMax, undefined);
    });

    it("handles Infinity salary values", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ salaryMin: Infinity, salaryMax: Infinity }), "adzuna");
      assert.equal(job.salaryMin, undefined);
      assert.equal(job.salaryMax, undefined);
    });

    it("handles negative salary values", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ salaryMin: -100, salaryMax: 50000 }), "adzuna");
      assert.equal(job.salaryMin, undefined);
      assert.equal(job.salaryMax, 50000);
    });

    it("omits salary when both undefined", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ salaryMin: undefined, salaryMax: undefined }), "adzuna");
      assert.equal("salaryMin" in job, false);
      assert.equal("salaryMax" in job, false);
    });

    it("preserves salary currency", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ salaryCurrency: "GBP" }), "adzuna");
      assert.equal(job.salaryCurrency, "GBP");
    });
  });

  describe("remote detection", () => {
    it("detects remote from explicit isRemote flag", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ isRemote: true }), "adzuna");
      assert.equal(job.isRemote, true);
    });

    it("detects remote from title containing 'remote'", () => {
      const job = jobNormalizer.normalizeJobResult(
        makeRaw({ title: "Remote Software Engineer", isRemote: false }),
        "adzuna",
      );
      assert.equal(job.isRemote, true);
    });

    it("detects remote from location containing 'work from home'", () => {
      const job = jobNormalizer.normalizeJobResult(
        makeRaw({ location: "Work from Home", isRemote: false }),
        "adzuna",
      );
      assert.equal(job.isRemote, true);
    });

    it("detects remote from location containing 'WFH'", () => {
      const job = jobNormalizer.normalizeJobResult(
        makeRaw({ location: "WFH - Anywhere in UK", isRemote: false }),
        "adzuna",
      );
      assert.equal(job.isRemote, true);
    });

    it("detects remote from description containing 'remote'", () => {
      const job = jobNormalizer.normalizeJobResult(
        makeRaw({ description: "This role is fully remote", isRemote: false }),
        "adzuna",
      );
      assert.equal(job.isRemote, true);
    });

    it("returns false when no remote indicators present", () => {
      const job = jobNormalizer.normalizeJobResult(
        makeRaw({ isRemote: false, location: "London, UK" }),
        "adzuna",
      );
      assert.equal(job.isRemote, false);
    });
  });

  describe("seniority extraction", () => {
    it("extracts junior from title", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ title: "Junior Software Engineer" }), "adzuna");
      assert.equal(job.seniority, "junior");
    });

    it("extracts senior from title", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ title: "Senior Software Engineer" }), "adzuna");
      assert.equal(job.seniority, "senior");
    });

    it("extracts lead from title", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ title: "Lead Engineer" }), "adzuna");
      assert.equal(job.seniority, "lead");
    });

    it("extracts executive from title", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ title: "Executive Director" }), "adzuna");
      assert.equal(job.seniority, "executive");
    });

    it("extracts mid-level from title", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ title: "Mid-Level Engineer" }), "adzuna");
      assert.equal(job.seniority, "mid");
    });

    it("returns undefined when no seniority keywords found", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ title: "Software Engineer" }), "adzuna");
      assert.equal(job.seniority, undefined);
    });

    it("detects seniority from description when not in title", () => {
      const job = jobNormalizer.normalizeJobResult(
        makeRaw({ title: "Software Engineer", description: "We are looking for a senior developer" }),
        "adzuna",
      );
      assert.equal(job.seniority, "senior");
    });
  });

  describe("missing/empty optional fields", () => {
    it("handles empty title gracefully", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ title: "" }), "adzuna");
      assert.equal(job.title, "");
    });

    it("handles empty company gracefully", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ company: "" }), "adzuna");
      assert.equal(job.company, "");
    });

    it("handles missing summary", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ summary: undefined }), "adzuna");
      assert.equal(job.summary, undefined);
    });

    it("handles missing location", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ location: undefined }), "adzuna");
      assert.equal(job.location, undefined);
    });

    it("handles missing skills array", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ skills: [] }), "adzuna");
      assert.deepEqual(job.skills, []);
    });

    it("handles missing postedAt", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw({ postedAt: undefined }), "adzuna");
      assert.equal(job.postedAt, undefined);
    });

    it("truncates long summary", () => {
      const longSummary = "a".repeat(2000);
      const job = jobNormalizer.normalizeJobResult(makeRaw({ summary: longSummary }), "adzuna");
      assert.equal(job.summary?.length, 1000);
    });

    it("truncates long location", () => {
      const longLocation = "a".repeat(500);
      const job = jobNormalizer.normalizeJobResult(makeRaw({ location: longLocation }), "adzuna");
      assert.equal(job.location?.length, 300);
    });

    it("sets isActive to true", () => {
      const job = jobNormalizer.normalizeJobResult(makeRaw(), "adzuna");
      assert.equal(job.isActive, true);
    });

    it("sets fetchedAt to current ISO string", () => {
      const before = new Date().toISOString();
      const job = jobNormalizer.normalizeJobResult(makeRaw(), "adzuna");
      const after = new Date().toISOString();
      assert.ok(job.fetchedAt >= before);
      assert.ok(job.fetchedAt <= after);
    });
  });
});
