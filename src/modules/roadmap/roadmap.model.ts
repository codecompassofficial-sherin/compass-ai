import { Schema, model } from "mongoose";
import type { Model, Types } from "mongoose";
import { GENERATION_REASONS, ROADMAP_STATUSES } from "./roadmap.types.js";
import type {
  AssessmentSnapshot,
  GenerationReason,
  RoadmapPhase,
  RoadmapStatus,
} from "./roadmap.types.js";

export interface RoadmapDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  version: number;
  status: RoadmapStatus;
  assessmentSnapshot: AssessmentSnapshot;
  phases: RoadmapPhase[];
  engineVersion: string;
  catalogVersion: string;
  reason: GenerationReason;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentSnapshotSchema = new Schema<AssessmentSnapshot>(
  {
    targetRole: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    technologyPreferences: { type: [String], required: true },
    currentSkills: { type: [String], required: true },
    primaryCareerGoal: { type: String, required: true },
    additionalNotes: { type: String },
    targetTimeline: { type: String, required: true },
  },
  { _id: false },
);

const roadmapPhaseSchema = new Schema<RoadmapPhase>(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false },
);

const roadmapSchema = new Schema<RoadmapDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    version: { type: Number, required: true, default: 1 },
    status: { type: String, enum: [...ROADMAP_STATUSES], required: true, default: "active" },
    assessmentSnapshot: { type: assessmentSnapshotSchema, required: true },
    phases: { type: [roadmapPhaseSchema], required: true },
    engineVersion: { type: String, required: true },
    catalogVersion: { type: String, required: true },
    reason: { type: String, enum: [...GENERATION_REASONS], required: true },
    generatedAt: { type: Date, required: true },
  },
  { timestamps: true, collection: "roadmaps" },
);

roadmapSchema.index({ userId: 1, version: 1 }, { unique: true });
roadmapSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } },
);

export const RoadmapModel: Model<RoadmapDocument> = model<RoadmapDocument>(
  "Roadmap",
  roadmapSchema,
  "roadmaps",
);
