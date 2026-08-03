import type { Request, Response } from "express";
import { success } from "../../shared/common/ApiResponse.js";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  get: async (req: Request, res: Response): Promise<void> => {
    const dashboard = await dashboardService.get(req.auth!.user.id);
    res.status(200).json(success({ dashboard }));
  },
};
