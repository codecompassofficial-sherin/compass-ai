import { AppError } from "../../shared/common/AppError.js";

export const jobsErrors = {
  jobNotFound: () =>
    AppError.notFound("Job not found", {
      code: "JOB_NOT_FOUND",
    }),
  invalidJobId: () =>
    AppError.badRequest("Invalid job id", {
      code: "INVALID_JOB_ID",
    }),
  sourceUnavailable: (source: string) =>
    AppError.serviceUnavailable(`Job source "${source}" is currently unavailable`, {
      code: "JOB_SOURCE_UNAVAILABLE",
      details: { source },
    }),
};
