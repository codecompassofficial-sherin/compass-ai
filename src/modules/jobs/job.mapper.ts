import type { JobDocument } from "./job.model.js";
import type { PublicJob } from "./job.types.js";

export function toPublicJob(job: JobDocument): PublicJob {
  return {
    id: job._id.toString(),
    source: job.source,
    sourceId: job.sourceId,
    title: job.title,
    company: job.company,
    description: job.description,
    ...(job.summary ? { summary: job.summary } : {}),
    ...(job.location ? { location: job.location } : {}),
    isRemote: job.isRemote,
    url: job.url,
    ...(job.salaryMin !== undefined ? { salaryMin: job.salaryMin } : {}),
    ...(job.salaryMax !== undefined ? { salaryMax: job.salaryMax } : {}),
    ...(job.salaryCurrency ? { salaryCurrency: job.salaryCurrency } : {}),
    ...(job.employmentType ? { employmentType: job.employmentType } : {}),
    ...(job.seniority ? { seniority: job.seniority } : {}),
    skills: [...job.skills],
    tags: [...job.tags],
    ...(job.postedAt ? { postedAt: job.postedAt.toISOString() } : {}),
    fetchedAt: job.fetchedAt.toISOString(),
    isActive: job.isActive,
  };
}
