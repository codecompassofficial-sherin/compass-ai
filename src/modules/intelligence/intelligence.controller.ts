import type { Request, Response } from "express";
import { success } from "../../shared/common/ApiResponse.js";
import { intelligenceService } from "./intelligence.service.js";

export const intelligenceController = {
  get: async (req: Request, res: Response): Promise<void> => {
    const data = await intelligenceService.get(req.auth!.user.id);
    res.status(200).json(success(data));
  },
};
