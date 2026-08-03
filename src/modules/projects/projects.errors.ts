import { AppError } from "../../shared/common/AppError.js";

export const projectsErrors = {
  projectNotFound: () =>
    AppError.notFound("Project not found", {
      code: "PROJECT_NOT_FOUND",
    }),
  invalidProjectId: () =>
    AppError.badRequest("Invalid project id", {
      code: "INVALID_PROJECT_ID",
    }),
  invalidStatusTransition: () =>
    AppError.conflict("Invalid project status transition", {
      code: "INVALID_PROJECT_STATUS_TRANSITION",
    }),
  cannotCompleteProject: () =>
    AppError.conflict("Only projects in progress can be completed", {
      code: "PROJECT_CANNOT_COMPLETE",
    }),
  cannotArchiveProject: () =>
    AppError.conflict("Project cannot be archived", {
      code: "PROJECT_CANNOT_ARCHIVE",
    }),
};
