import { Schema, model } from "mongoose";
import type { Model, Types } from "mongoose";
import { TASK_STATUSES } from "./goals.types.js";
import type { TaskStatus } from "./goals.types.js";

export interface TaskInstanceDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  roadmapId: Types.ObjectId;
  goalId: Types.ObjectId;
  order: number;
  title: string;
  description: string;
  estimatedEffortHours: number;
  templateVersion: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const taskInstanceSchema = new Schema<TaskInstanceDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    roadmapId: { type: Schema.Types.ObjectId, ref: "Roadmap", required: true, index: true },
    goalId: { type: Schema.Types.ObjectId, ref: "GoalInstance", required: true, index: true },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    estimatedEffortHours: { type: Number, required: true },
    templateVersion: { type: String, required: true },
    status: { type: String, enum: [...TASK_STATUSES], required: true, default: "todo" },
  },
  { timestamps: true, collection: "taskinstances" },
);

taskInstanceSchema.index({ goalId: 1, order: 1 });
taskInstanceSchema.index({ userId: 1, roadmapId: 1, goalId: 1 });

export const TaskInstanceModel: Model<TaskInstanceDocument> = model<TaskInstanceDocument>(
  "TaskInstance",
  taskInstanceSchema,
  "taskinstances",
);
