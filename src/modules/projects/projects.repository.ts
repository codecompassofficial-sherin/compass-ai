import { Types } from "mongoose";
import type { FilterQuery } from "mongoose";
import type { ProjectDocument } from "./project.model.js";
import { ProjectModel } from "./project.model.js";
import type { CreateProjectInput, UpdateProjectInput } from "./projects.validation.js";

export type ProjectUpdateInput = Omit<UpdateProjectInput, "status"> & {
  status?: string;
  completedAt?: Date | null;
};

function isUsableField(value: unknown): boolean {
  if (value === undefined) {
    return false;
  }
  if (value instanceof Date) {
    return true;
  }
  if (typeof value === "object" && value !== null && Object.keys(value).length === 0) {
    return false;
  }
  return true;
}

function toUpdateFields(input: ProjectUpdateInput): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (isUsableField(value)) {
      fields[key] = value;
    }
  }
  return fields;
}

export const projectsRepository = {
  async findByIdForUser(id: Types.ObjectId, userId: string): Promise<ProjectDocument | null> {
    return ProjectModel.findOne({ _id: id, userId });
  },

  async listForUser(userId: string): Promise<ProjectDocument[]> {
    return ProjectModel.find({ userId, status: { $ne: "archived" } }).sort({ createdAt: -1 });
  },

  async create(
    input: CreateProjectInput & { userId: Types.ObjectId },
  ): Promise<ProjectDocument> {
    return ProjectModel.create(input);
  },

  async update(
    id: Types.ObjectId,
    userId: string,
    input: ProjectUpdateInput,
  ): Promise<ProjectDocument | null> {
    const filter: FilterQuery<ProjectDocument> = { _id: id, userId };
    return ProjectModel.findOneAndUpdate(filter, toUpdateFields(input), {
      new: true,
      runValidators: true,
    });
  },
};
