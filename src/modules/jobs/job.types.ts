import type { JOB_SOURCES } from "./job.constants.js";

export type JobSource = (typeof JOB_SOURCES)[number];

export interface NormalizedJob {
  id: string;
  source: JobSource;
  sourceId: string;
  title: string;
  company: string;
  description: string;
  summary?: string;
  location?: string;
  isRemote: boolean;
  url: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  employmentType?: string;
  seniority?: string;
  skills: string[];
  tags: string[];
  postedAt?: string;
  fetchedAt: string;
  isActive: boolean;
  normalizedHash: string;
}

export type PublicJob = Omit<NormalizedJob, "normalizedHash">;

export interface JobSearchParams {
  keywords: string;
  location?: string;
  sources?: JobSource[];
  employmentType?: string;
  remoteOnly?: boolean;
  page?: number;
  limit?: number;
}
