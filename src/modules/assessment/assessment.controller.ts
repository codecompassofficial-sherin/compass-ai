import type { Request, Response } from "express";
import { success } from "../../shared/common/ApiResponse.js";
import { assessmentService } from "./assessment.service.js";
import type { CreateAssessmentInput, UpdateAssessmentInput } from "./assessment.validation.js";

export const assessmentController = {
  create: async (req: Request, res: Response): Promise<void> => {
    const assessment = await assessmentService.create(
      req.auth!.user.id,
      req.body as CreateAssessmentInput,
    );
    res.status(201).json(success({ assessment }));
  },

  get: async (req: Request, res: Response): Promise<void> => {
    const assessment = await assessmentService.get(req.auth!.user.id);
    res.status(200).json(success({ assessment }));
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const assessment = await assessmentService.update(
      req.auth!.user.id,
      req.body as UpdateAssessmentInput,
    );
    res.status(200).json(success({ assessment }));
  },
};
