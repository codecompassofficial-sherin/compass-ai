import { createHash } from "node:crypto";
import type { RawJobResult } from "./sources/job-source.interface.js";
import type { NormalizedJob, JobSource } from "./job.types.js";

const SENIORITY_KEYWORDS: readonly { pattern: RegExp; level: string }[] = [
  { pattern: /\bexecutive\b/i, level: "executive" },
  { pattern: /\bsenior\b/i, level: "senior" },
  { pattern: /\blead\b/i, level: "lead" },
  { pattern: /\bjunior\b/i, level: "junior" },
  { pattern: /\bmid[- ]?level\b/i, level: "mid" },
];

const REMOTE_KEYWORDS: readonly RegExp[] = [
  /\bremote\b/i,
  /\bwork\s+from\s+home\b/i,
  /\bwfh\b/i,
  /\banywhere\b/i,
];

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  full_time: "full_time",
  "full-time": "full_time",
  fulltime: "full_time",
  "full time": "full_time",
  part_time: "part_time",
  "part-time": "part_time",
  parttime: "part_time",
  "part time": "part_time",
  contract: "contract",
  freelance: "contract",
  internship: "internship",
  "intern": "internship",
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function computeNormalizedHash(source: string, title: string, company: string): string {
  const payload = `${source}|${normalizeText(title)}|${normalizeText(company)}`;
  return createHash("sha256").update(payload).digest("hex");
}

function extractSeniority(title: string, description: string): string | undefined {
  const combined = `${title} ${description}`;
  for (const { pattern, level } of SENIORITY_KEYWORDS) {
    if (pattern.test(combined)) {
      return level;
    }
  }
  return undefined;
}

function detectRemote(
  explicitIsRemote: boolean,
  title: string,
  location: string,
  description: string,
): boolean {
  if (explicitIsRemote) return true;
  const combined = `${title} ${location} ${description}`;
  return REMOTE_KEYWORDS.some((kw) => kw.test(combined));
}

function mapEmploymentType(raw?: string): string | undefined {
  if (!raw) return undefined;
  const key = raw.toLowerCase().trim();
  return EMPLOYMENT_TYPE_MAP[key] ?? undefined;
}

function normalizeSalary(
  salaryMin?: number,
  salaryMax?: number,
): { salaryMin?: number; salaryMax?: number } {
  const min =
    typeof salaryMin === "number" && Number.isFinite(salaryMin) && salaryMin >= 0
      ? salaryMin
      : undefined;
  const max =
    typeof salaryMax === "number" && Number.isFinite(salaryMax) && salaryMax >= 0
      ? salaryMax
      : undefined;

  if (min !== undefined && max !== undefined && min > max) {
    return { salaryMin: max, salaryMax: min };
  }
  return { salaryMin: min, salaryMax: max };
}

function truncate(text: string | undefined, maxLen: number): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (trimmed.length === 0) return undefined;
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

export function normalizeJobResult(raw: RawJobResult, source: JobSource): NormalizedJob {
  const title = raw.title?.trim() ?? "";
  const company = raw.company?.trim() ?? "";

  const { salaryMin, salaryMax } = normalizeSalary(raw.salaryMin, raw.salaryMax);

  const isRemote = detectRemote(raw.isRemote, raw.title ?? "", raw.location ?? "", raw.description ?? "");

  return {
    id: "",
    source,
    sourceId: raw.sourceId,
    title,
    company,
    description: raw.description ?? "",
    summary: truncate(raw.summary, 1000),
    location: truncate(raw.location, 300),
    isRemote,
    url: raw.url ?? "",
    ...(salaryMin !== undefined ? { salaryMin } : {}),
    ...(salaryMax !== undefined ? { salaryMax } : {}),
    ...(raw.salaryCurrency ? { salaryCurrency: raw.salaryCurrency } : {}),
    employmentType: mapEmploymentType(raw.employmentType),
    seniority: extractSeniority(raw.title ?? "", raw.description ?? ""),
    skills: Array.isArray(raw.skills) ? [...raw.skills] : [],
    tags: Array.isArray(raw.tags) ? [...raw.tags] : [],
    ...(raw.postedAt ? { postedAt: raw.postedAt.toISOString() } : {}),
    fetchedAt: new Date().toISOString(),
    isActive: true,
    normalizedHash: computeNormalizedHash(source, title, company),
  };
}

export function generateNormalizedHash(source: string, title: string, company: string): string {
  return computeNormalizedHash(source, title, company);
}

export const jobNormalizer = {
  normalizeJobResult,
  generateNormalizedHash,
};
