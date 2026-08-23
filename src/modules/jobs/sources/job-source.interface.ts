import type { JobSource } from "../job.types.js";

export interface RawJobResult {
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
  postedAt?: Date;
}

export interface JobSourceSearchParams {
  keywords: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface JobSourceAdapter {
  readonly sourceName: JobSource;

  search(params: JobSourceSearchParams): Promise<RawJobResult[]>;
}
