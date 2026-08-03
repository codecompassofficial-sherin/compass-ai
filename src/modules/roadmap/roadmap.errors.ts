import { AppError } from "../../shared/common/AppError.js";

export const roadmapErrors = {
  assessmentRequired: () =>
    AppError.conflict("Complete your career assessment before generating a roadmap", {
      code: "ROADMAP_ASSESSMENT_REQUIRED",
    }),
  roadmapAlreadyExists: () =>
    AppError.conflict("An active roadmap already exists for this user", {
      code: "ROADMAP_ALREADY_EXISTS",
    }),
  noActiveRoadmap: () =>
    AppError.notFound("No active roadmap found for this user", {
      code: "NO_ACTIVE_ROADMAP",
    }),
  noActiveRoadmapToRegenerate: () =>
    AppError.conflict("No active roadmap found to regenerate", {
      code: "NO_ACTIVE_ROADMAP",
    }),
  roadmapNotFound: () =>
    AppError.notFound("Roadmap not found", {
      code: "ROADMAP_NOT_FOUND",
    }),
  invalidRoadmapId: () =>
    AppError.badRequest("Invalid roadmap id", {
      code: "INVALID_ROADMAP_ID",
    }),
  invalidRoadmapVersion: () =>
    AppError.badRequest("Invalid roadmap version", {
      code: "INVALID_ROADMAP_VERSION",
    }),
};
