import { AppError } from "../../shared/common/AppError.js";

export const assessmentErrors = {
  assessmentAlreadyExists: () =>
    AppError.conflict("An assessment already exists for this user", {
      code: "ASSESSMENT_ALREADY_EXISTS",
    }),
  assessmentNotFound: () =>
    AppError.notFound("No assessment found for this user", {
      code: "ASSESSMENT_NOT_FOUND",
    }),
};
