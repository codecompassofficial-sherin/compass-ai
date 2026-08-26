import { env } from "../../../config/env.js";
import type { JobSourceAdapter, JobSourceSearchParams, RawJobResult } from "./job-source.interface.js";

const ADZUNA_BASE_URL = "https://api.adzuna.com/v1/api/jobs";
const ADZUNA_COUNTRY = "gb";
const ADZUNA_RESULTS_PER_PAGE = 50;

interface AdzunaLocation {
  display_name?: string;
  area?: string[];
}

interface AdzunaResult {
  title?: string;
  company?: { display_name?: string };
  description?: string;
  location?: AdzunaLocation;
  redirect_url?: string;
  salary_min?: number;
  salary_max?: number;
  created?: string;
  id?: string;
  contract_time?: string;
  category?: { label?: string };
  subtitle?: string;
}

interface AdzunaApiResponse {
  results?: AdzunaResult[];
  count?: number;
  error?: string;
}

function parseAdzunaEmploymentType(contractTime?: string): string | undefined {
  if (!contractTime) return undefined;
  const lower = contractTime.toLowerCase().trim();
  if (lower === "full_time" || lower === "full time") return "full_time";
  if (lower === "part_time" || lower === "part time") return "part_time";
  return undefined;
}

function mapAdzunaResult(result: AdzunaResult): RawJobResult | null {
  if (!result.id || !result.title) return null;

  return {
    sourceId: result.id,
    title: result.title.trim(),
    company: result.company?.display_name?.trim() ?? "Unknown",
    description: result.description?.trim() ?? "",
    summary: result.subtitle?.trim(),
    location: result.location?.display_name?.trim(),
    isRemote: false,
    url: result.redirect_url ?? "",
    salaryMin: typeof result.salary_min === "number" ? result.salary_min : undefined,
    salaryMax: typeof result.salary_max === "number" ? result.salary_max : undefined,
    salaryCurrency: "GBP",
    employmentType: parseAdzunaEmploymentType(result.contract_time),
    seniority: undefined,
    skills: result.category?.label ? [result.category.label] : [],
    tags: result.category?.label ? [result.category.label] : [],
    postedAt: result.created ? new Date(result.created) : undefined,
  };
}

export function createAdzunaAdapter(): JobSourceAdapter | null {
  const appId = env.adzunaAppId;
  const appKey = env.adzunaAppKey;
  if (!appId || !appKey) return null;

  return {
    sourceName: "adzuna",

    async search(params: JobSourceSearchParams): Promise<RawJobResult[]> {
      const page = params.page ?? 1;
      const perPage = ADZUNA_RESULTS_PER_PAGE;

      const url = new URL(`${ADZUNA_BASE_URL}/${ADZUNA_COUNTRY}/search/${page}`);
      url.searchParams.set("app_id", appId);
      url.searchParams.set("app_key", appKey);
      url.searchParams.set("results_per_page", String(perPage));
      url.searchParams.set("what", params.keywords);
      if (params.location) {
        url.searchParams.set("where", params.location);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        throw new Error(`Adzuna API returned ${response.status}`);
      }

      const data: AdzunaApiResponse = await response.json() as AdzunaApiResponse;

      if (data.error) {
        throw new Error(`Adzuna API error: ${data.error}`);
      }

      if (!Array.isArray(data.results)) {
        return [];
      }

      return data.results
        .map(mapAdzunaResult)
        .filter((r): r is RawJobResult => r !== null);
    },
  };
}
