import { Schema, model } from "mongoose";
import type { Model, Types } from "mongoose";
import { GOAL_INSTANCE_STATUSES } from "./roadmap.types.js";
import type { GoalBindings, GoalInstanceStatus } from "./roadmap.types.js";

export interface GoalInstanceDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  roadmapId: Types.ObjectId;
  phaseKey: string;
  order: number;
  templateKey: string;
  templateVersion: string;
  title: string;
  description: string;
  skillTargets: string[];
  prerequisites: string[];
  estimatedEffortHours: number;
  bindings: GoalBindings;
  status: GoalInstanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const goalBindingsSchema = new Schema<GoalBindings>(
  {
    technologyPreferences: { type: [String], required: true },
    currentSkills: { type: [String], required: true },
  },
  { _id: false },
);

const goalInstanceSchema = new Schema<GoalInstanceDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: "Roadmap", required: true, index: true },
    phaseKey: { type: String, required: true },
    order: { type: Number, required: true },
    templateKey: { type: String, required: true },
    templateVersion: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    skillTargets: { type: [String], required: true },
    prerequisites: { type: [String], required: true },
    estimatedEffortHours: { type: Number, required: true },
    bindings: { type: goalBindingsSchema, required: true },
    status: { type: String, enum: [...GOAL_INSTANCE_STATUSES], required: true, default: "draft" },
  },
  { timestamps: true, collection: "goalinstances" },
);

goalInstanceSchema.index({ roadmapId: 1, phaseKey: 1, order: 1 });

export const GoalInstanceModel: Model<GoalInstanceDocument> = model<GoalInstanceDocument>(
  "GoalInstance",
  goalInstanceSchema,
  "goalinstances",
);
