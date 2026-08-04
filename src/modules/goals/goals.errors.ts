import { AppError } from "../../shared/common/AppError.js";

export const goalsErrors = {
  noActiveRoadmap: () =>
    AppError.notFound("No active roadmap found for this user", {
      code: "NO_ACTIVE_ROADMAP",
    }),
  goalNotFound: () =>
    AppError.notFound("Goal not found", {
      code: "GOAL_NOT_FOUND",
    }),
  invalidGoalId: () =>
    AppError.badRequest("Invalid goal id", {
      code: "INVALID_GOAL_ID",
    }),
  goalAlreadyActive: () =>
    AppError.conflict("Goal is already active", {
      code: "GOAL_ALREADY_ACTIVE",
    }),
  goalNotActive: () =>
    AppError.conflict("Goal is not active", {
      code: "GOAL_NOT_ACTIVE",
    }),
  goalAlreadyCompleted: () =>
    AppError.conflict("Goal is already completed", {
      code: "GOAL_ALREADY_COMPLETED",
    }),
  taskNotFound: () =>
    AppError.notFound("Task not found", {
      code: "TASK_NOT_FOUND",
    }),
  invalidTaskId: () =>
    AppError.badRequest("Invalid task id", {
      code: "INVALID_TASK_ID",
    }),
  invalidTaskStatusTransition: () =>
    AppError.conflict("Invalid task status transition", {
      code: "INVALID_TASK_STATUS_TRANSITION",
    }),
};
