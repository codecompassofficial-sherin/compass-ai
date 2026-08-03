import { Schema, model } from "mongoose";
import type { Model, Types } from "mongoose";
import { PROJECT_STATUSES } from "./projects.constants.js";
import type { ProjectStatus } from "./projects.constants.js";

export interface ProjectDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  technologyStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: ProjectStatus;
  relatedGoalIds: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000 },
    technologyStack: { type: [String], required: true, default: [] },
    githubUrl: { type: String, trim: true, maxlength: 500 },
    liveUrl: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: [...PROJECT_STATUSES],
      required: true,
      default: "planned",
      index: true,
    },
    relatedGoalIds: { type: [String], default: [] },
    completedAt: { type: Date },
  },
  { timestamps: true, collection: "projects" },
);

projectSchema.index({ userId: 1, createdAt: -1 });

export const ProjectModel: Model<ProjectDocument> = model<ProjectDocument>(
  "Project",
  projectSchema,
  "projects",
);
