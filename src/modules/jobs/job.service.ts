import type { JobSearchParams } from "./job.types.js";
import { jobFetcher, type FetchJobsResult } from "./job.fetcher.js";
import { toPublicJob } from "./job.mapper.js";

async function getHealth(): Promise<{ status: string; module: string; timestamp: string }> {
  return {
    status: "ok",
    module: "job-intelligence",
    timestamp: new Date().toISOString(),
  };
}

async function fetchJobs(params: JobSearchParams): Promise<FetchJobsResult> {
  return jobFetcher.fetchJobs(params);
}

export const jobService = {
  toPublicJob,
  getHealth,
  fetchJobs,
};
