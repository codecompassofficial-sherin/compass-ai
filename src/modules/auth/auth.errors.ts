import { AppError } from "../../shared/common/AppError.js";

export const authErrors = {
  emailAlreadyExists: () =>
    AppError.conflict("An account with this email already exists", {
      code: "EMAIL_ALREADY_EXISTS",
    }),
  invalidCredentials: () =>
    AppError.unauthorized("Invalid email or password", { code: "INVALID_CREDENTIALS" }),
  invalidAccessToken: () =>
    AppError.unauthorized("Invalid or expired access token", { code: "INVALID_ACCESS_TOKEN" }),
  invalidRefreshToken: () =>
    AppError.unauthorized("Invalid or expired refresh token", { code: "INVALID_REFRESH_TOKEN" }),
  insufficientPermissions: () =>
    AppError.forbidden("You do not have permission to perform this action", {
      code: "FORBIDDEN",
    }),
  invalidVerificationToken: () =>
    AppError.badRequest("Invalid or expired email verification token", {
      code: "INVALID_VERIFICATION_TOKEN",
    }),
  invalidResetToken: () =>
    AppError.badRequest("Invalid or expired password reset token", {
      code: "INVALID_RESET_TOKEN",
    }),
};
