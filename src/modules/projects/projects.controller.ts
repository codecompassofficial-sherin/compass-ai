import type { Request, Response } from "express";
import { Types } from "mongoose";
import { success } from "../../shared/common/ApiResponse.js";
import { projectsErrors } from "./projects.errors.js";
import { projectsService } from "./projects.service.js";
import type { CreateProjectInput, UpdateProjectInput } from "./projects.validation.js";

function parseProjectId(raw: unknown): Types.ObjectId {
  if (typeof raw !== "string" || raw.length === 0 || !Types.ObjectId.isValid(raw)) {
    throw projectsErrors.invalidProjectId();
  }
  return new Types.ObjectId(raw);
}

export const projectsController = {
  create: async (req: Request, res: Response): Promise<void> => {
    const project = await projectsService.create(
      req.auth!.user.id,
      req.body as CreateProjectInput,
    );
    res.status(201).json(success({ project }));
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const project = await projectsService.get(
      req.auth!.user.id,
      parseProjectId(req.params.id),
    );
    res.status(200).json(success({ project }));
  },

  list: async (req: Request, res: Response): Promise<void> => {
    const projects = await projectsService.list(req.auth!.user.id);
    res.status(200).json(success({ projects }));
  },

  update: async (req: Request, res: Response): Promise<void> => {
    const project = await projectsService.update(
      req.auth!.user.id,
      parseProjectId(req.params.id),
      req.body as UpdateProjectInput,
    );
    res.status(200).json(success({ project }));
  },

  complete: async (req: Request, res: Response): Promise<void> => {
    const project = await projectsService.complete(
      req.auth!.user.id,
      parseProjectId(req.params.id),
    );
    res.status(200).json(success({ project }));
  },

  archive: async (req: Request, res: Response): Promise<void> => {
    const project = await projectsService.archive(
      req.auth!.user.id,
      parseProjectId(req.params.id),
    );
    res.status(200).json(success({ project }));
  },
};
