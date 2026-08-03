import type { Request, Response } from "express";
import { Types } from "mongoose";
import { success } from "../../shared/common/ApiResponse.js";
import { roadmapErrors } from "./roadmap.errors.js";
import { roadmapService } from "./roadmap.service.js";

function parseRoadmapId(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0 || !Types.ObjectId.isValid(raw)) {
    throw roadmapErrors.invalidRoadmapId();
  }
  return raw;
}

function parseVersion(raw: unknown): number {
  const version = typeof raw === "string" ? Number(raw) : Number.NaN;
  if (!Number.isInteger(version) || version < 1) {
    throw roadmapErrors.invalidRoadmapVersion();
  }
  return version;
}

export const roadmapController = {
  generate: async (req: Request, res: Response): Promise<void> => {
    const roadmap = await roadmapService.generate(req.auth!.user.id);
    res.status(201).json(success({ roadmap }));
  },

  regenerate: async (req: Request, res: Response): Promise<void> => {
    const roadmap = await roadmapService.regenerate(req.auth!.user.id);
    res.status(201).json(success({ roadmap }));
  },

  getActive: async (req: Request, res: Response): Promise<void> => {
    const roadmap = await roadmapService.getActive(req.auth!.user.id);
    res.status(200).json(success({ roadmap }));
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const roadmap = await roadmapService.getById(
      req.auth!.user.id,
      parseRoadmapId(req.params.id),
    );
    res.status(200).json(success({ roadmap }));
  },

  getHistory: async (req: Request, res: Response): Promise<void> => {
    const history = await roadmapService.getHistory(req.auth!.user.id);
    res.status(200).json(success({ history }));
  },

  compare: async (req: Request, res: Response): Promise<void> => {
    const diff = await roadmapService.compare(
      req.auth!.user.id,
      parseVersion(req.query.from),
      parseVersion(req.query.to),
    );
    res.status(200).json(success({ diff }));
  },
};
