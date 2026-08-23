import type { Request, Response } from "express";
import { success } from "../../shared/common/ApiResponse.js";
import { jobService } from "./job.service.js";

export const jobController = {
  health: async (_req: Request, res: Response): Promise<void> => {
    const data = await jobService.getHealth();
    res.status(200).json(success(data));
  },
};
