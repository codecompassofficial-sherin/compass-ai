import type { JobSource, JobSearchParams, NormalizedJob, PublicJob } from "./job.types.js";
import type { JobSourceAdapter, JobSourceSearchParams } from "./sources/job-source.interface.js";
import { createAdzunaAdapter } from "./sources/adzuna.adapter.js";
import { createJoobleAdapter } from "./sources/jooble.adapter.js";
import { jobNormalizer } from "./job.normalizer.js";
import { jobRepository } from "./job.repository.js";
import { toPublicJob } from "./job.mapper.js";
import { logger } from "../../shared/logger/logger.js";

const SECRET_ENV_KEYS = ["ADZUNA_APP_ID", "ADZUNA_APP_KEY", "JOOBLE_API_KEY"] as const;

export interface FetchJobsResult {
  jobs: PublicJob[];
  /** Total number of active jobs in the DB matching the current filter (not limited to the current page). */
  total: number;
  page: number;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}

function sanitizeErrorMessage(message: string): string {
  let sanitized = message;
  for (const key of SECRET_ENV_KEYS) {
    const value = process.env[key];
    if (value) {
      sanitized = sanitized.split(value).join("[redacted]");
    }
  }
  sanitized = sanitized.replace(/https?:\/\/\S+/gi, "[url]");
  return sanitized.replace(/([?&](?:app_id|app_key|api_key|apikey|key|token)=)[^&\s]+/gi, "$1[redacted]");
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
      } catch (error) {
        logger.warn(
          {
            source: adapter.sourceName,
            operation: "fetch",
            error: sanitizeErrorMessage(errorMessage(error)),
            keywords: params.keywords,
            page,
          },
          "Job provider failed; skipping source",
        );
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
      } catch (error) {
        logger.error(
          {
            source: job.source,
            operation: "upsert",
            error: sanitizeErrorMessage(errorMessage(error)),
            keywords: params.keywords,
            page,
          },
          "Job upsert failed; skipping job",
        );
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
