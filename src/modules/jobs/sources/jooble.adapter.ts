import { createHash } from "node:crypto";
import { env } from "../../../config/env.js";
import type { JobSourceAdapter, JobSourceSearchParams, RawJobResult } from "./job-source.interface.js";

const JOOBLE_API_URL = "https://jooble.org/api/";

interface JoobleResult {
  title?: string;
  company?: string;
  description?: string;
  snippet?: string;
  location?: string;
  salary?: string;
  link?: string;
  id?: string;
  posted?: string;
  type?: string;
}

interface JoobleApiResponse {
  totalCount?: number;
  jobs?: JoobleResult[];
}

function parseSalaryString(salary?: string): { salaryMin?: number; salaryMax?: number; salaryCurrency?: string } {
  if (!salary) return {};

  const cleaned = salary.replace(/[,.\s]/g, (match) => {
    if (match === ",") return "";
    return match;
  });

  const numbers = cleaned.match(/\d+/g);
  if (!numbers || numbers.length === 0) return {};

  const parsed = numbers.map(Number).filter((n) => Number.isFinite(n) && n > 0);
  if (parsed.length === 0) return {};

  let currency: string | undefined;
  if (/[£]/.test(salary)) currency = "GBP";
  else if (/[$]/.test(salary)) currency = "USD";
  else if (/[€]/.test(salary)) currency = "EUR";

  if (parsed.length >= 2) {
    return {
      salaryMin: Math.min(parsed[0]!, parsed[1]!),
      salaryMax: Math.max(parsed[0]!, parsed[1]!),
      ...(currency ? { salaryCurrency: currency } : {}),
    };
  }
  return {
    salaryMin: parsed[0],
    salaryMax: parsed[0],
    ...(currency ? { salaryCurrency: currency } : {}),
  };
}

function deterministicSourceId(title?: string, company?: string, location?: string): string {
  const payload = [title ?? "", company ?? "", location ?? ""]
    .map((s) => s.toLowerCase().trim())
    .join("|");
  return `jooble-${createHash("sha256").update(payload).digest("hex").slice(0, 16)}`;
}

function mapJoobleResult(result: JoobleResult): RawJobResult | null {
  if (!result.title) return null;

  const sourceId = result.id ?? result.link ?? deterministicSourceId(result.title, result.company, result.location);
  const { salaryMin, salaryMax, salaryCurrency } = parseSalaryString(result.salary);

  return {
    sourceId,
    title: result.title.trim(),
    company: result.company?.trim() ?? "Unknown",
    description: result.description?.trim() ?? result.snippet?.trim() ?? "",
    summary: result.snippet?.trim(),
    location: result.location?.trim(),
    isRemote: false,
    url: result.link ?? "",
    ...(salaryMin !== undefined ? { salaryMin } : {}),
    ...(salaryMax !== undefined ? { salaryMax } : {}),
    ...(salaryCurrency ? { salaryCurrency } : {}),
    employmentType: result.type?.trim(),
    seniority: undefined,
    skills: [],
    tags: result.type ? [result.type.trim()] : [],
    postedAt: result.posted ? new Date(result.posted) : undefined,
  };
}

export function createJoobleAdapter(): JobSourceAdapter | null {
  const apiKey = env.joobleApiKey;
  if (!apiKey) return null;

  return {
    sourceName: "jooble",

    async search(params: JobSourceSearchParams): Promise<RawJobResult[]> {
      const page = params.page ?? 1;

      const response = await fetch(JOOBLE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
        },
        body: JSON.stringify({
          keywords: params.keywords,
          ...(params.location ? { location: params.location } : {}),
          page,
        }),
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        throw new Error(`Jooble API returned ${response.status}`);
      }

      const data: JoobleApiResponse = await response.json() as JoobleApiResponse;

      if (!Array.isArray(data.jobs)) {
        return [];
      }

      return data.jobs
        .map(mapJoobleResult)
        .filter((r): r is RawJobResult => r !== null);
    },
  };
}
