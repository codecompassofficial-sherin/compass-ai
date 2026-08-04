import type { Request, Response } from "express";
import { Types } from "mongoose";
import { success } from "../../shared/common/ApiResponse.js";
import { goalsErrors } from "./goals.errors.js";
import { goalsService } from "./goals.service.js";
import type { UpdateTaskStatusInput } from "./goals.validation.js";

function parseGoalId(raw: unknown): Types.ObjectId {
  if (typeof raw !== "string" || raw.length === 0 || !Types.ObjectId.isValid(raw)) {
    throw goalsErrors.invalidGoalId();
  }
  return new Types.ObjectId(raw);
}

function parseTaskId(raw: unknown): Types.ObjectId {
  if (typeof raw !== "string" || raw.length === 0 || !Types.ObjectId.isValid(raw)) {
    throw goalsErrors.invalidTaskId();
  }
  return new Types.ObjectId(raw);
}

export const goalsController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const goals = await goalsService.listGoals(req.auth!.user.id);
    res.status(200).json(success({ goals }));
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const goal = await goalsService.getGoal(req.auth!.user.id, parseGoalId(req.params.id));
    res.status(200).json(success({ goal }));
  },

  activate: async (req: Request, res: Response): Promise<void> => {
    const goal = await goalsService.activateGoal(req.auth!.user.id, parseGoalId(req.params.id));
    res.status(200).json(success({ goal }));
  },

  complete: async (req: Request, res: Response): Promise<void> => {
    const goal = await goalsService.completeGoal(req.auth!.user.id, parseGoalId(req.params.id));
    res.status(200).json(success({ goal }));
  },

  updateTask: async (req: Request, res: Response): Promise<void> => {
    const goal = await goalsService.updateTaskStatus(
      req.auth!.user.id,
      parseGoalId(req.params.goalId),
      parseTaskId(req.params.taskId),
      req.body as UpdateTaskStatusInput,
    );
    res.status(200).json(success({ goal }));
  },
};
