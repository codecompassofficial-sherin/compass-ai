import type { JobSource, JobSearchParams, NormalizedJob, PublicJob } from "./job.types.js";
import type { JobSourceAdapter, JobSourceSearchParams } from "./sources/job-source.interface.js";
import { createAdzunaAdapter } from "./sources/adzuna.adapter.js";
import { createJoobleAdapter } from "./sources/jooble.adapter.js";
import { jobNormalizer } from "./job.normalizer.js";
import { jobRepository } from "./job.repository.js";
import { toPublicJob } from "./job.mapper.js";

export interface FetchJobsResult {
  jobs: PublicJob[];
  /** Total number of active jobs in the DB matching the current filter (not limited to the current page). */
  total: number;
  page: number;
}

function collectAdapters(): JobSourceAdapter[] {
  const adapters: JobSourceAdapter[] = [];
  const adzuna = createAdzunaAdapter();
  const jooble = createJoobleAdapter();
  if (adzuna) adapters.push(adzuna);
  if (jooble) adapters.push(jooble);
  return adapters;
}

function filterBySources(
  adapters: JobSourceAdapter[],
  sources?: JobSource[],
): JobSourceAdapter[] {
  if (!sources || sources.length === 0) return adapters;
  return adapters.filter((a) => sources.includes(a.sourceName));
}

function deduplicateByHash(
  jobs: NormalizedJob[],
): NormalizedJob[] {
  const seen = new Set<string>();
  const result: NormalizedJob[] = [];
  for (const job of jobs) {
    if (!seen.has(job.normalizedHash)) {
      seen.add(job.normalizedHash);
      result.push(job);
    }
  }
  return result;
}

export async function fetchJobs(params: JobSearchParams): Promise<FetchJobsResult> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  const allAdapters = collectAdapters();
  const adapters = filterBySources(allAdapters, params.sources);

  const searchParams: JobSourceSearchParams = {
    keywords: params.keywords,
    location: params.location,
    page,
    limit,
  };

  const resultsPerAdapter = await Promise.allSettled(
    adapters.map(async (adapter) => {
      try {
        const results = await adapter.search(searchParams);
        return results.map((r) => ({ raw: r, source: adapter.sourceName }));
      } catch {
        return [];
      }
    }),
  );

  const taggedResults = resultsPerAdapter.flatMap((r) =>
    r.status === "fulfilled" ? r.value : [],
  );

  const normalized = taggedResults.map(({ raw, source }) =>
    jobNormalizer.normalizeJobResult(raw, source),
  );

  const deduplicated = deduplicateByHash(normalized);

  const upserted = await Promise.all(
    deduplicated.map(async (job) => {
      try {
        const updated = await jobRepository.upsertBySourceAndId(job.source, job.sourceId, {
          title: job.title,
          company: job.company,
          description: job.description,
          summary: job.summary,
          location: job.location,
          isRemote: job.isRemote,
          url: job.url,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryCurrency: job.salaryCurrency,
          employmentType: job.employmentType,
          seniority: job.seniority,
          skills: job.skills,
          tags: job.tags,
          postedAt: job.postedAt ? new Date(job.postedAt) : undefined,
          fetchedAt: new Date(job.fetchedAt),
          normalizedHash: job.normalizedHash,
          isActive: true,
        });
        return toPublicJob(updated);
      } catch {
        return null;
      }
    }),
  );

  const persistedJobs = upserted.filter((j): j is PublicJob => j !== null);

  const filter: Record<string, unknown> = { isActive: true };
  if (params.employmentType) {
    filter.employmentType = params.employmentType;
  }
  if (params.remoteOnly) {
    filter.isRemote = true;
  }

  const { total } = await jobRepository.findActiveJobs(filter, { page: 1, limit: 1 });

  return {
    jobs: persistedJobs,
    total,
    page,
  };
}

export const jobFetcher = {
  fetchJobs,
};
