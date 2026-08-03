import { Schema, model } from "mongoose";
import type { Model, Types } from "mongoose";
import {
  CURRENT_SKILLS,
  EXPERIENCE_LEVELS,
  PRIMARY_CAREER_GOALS,
  TARGET_ROLES,
  TARGET_TIMELINES,
  TECHNOLOGY_PREFERENCES,
} from "./assessment.constants.js";
import type {
  CurrentSkill,
  ExperienceLevel,
  PrimaryCareerGoal,
  TargetRole,
  TargetTimeline,
  TechnologyPreference,
} from "./assessment.types.js";

export interface AssessmentDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  targetRole: TargetRole;
  experienceLevel: ExperienceLevel;
  technologyPreferences: TechnologyPreference[];
  currentSkills: CurrentSkill[];
  primaryCareerGoal: PrimaryCareerGoal;
  additionalNotes?: string;
  targetTimeline: TargetTimeline;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentSchema = new Schema<AssessmentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    targetRole: { type: String, enum: [...TARGET_ROLES], required: true },
    experienceLevel: { type: String, enum: [...EXPERIENCE_LEVELS], required: true },
    technologyPreferences: {
      type: [String],
      enum: [...TECHNOLOGY_PREFERENCES],
      required: true,
    },
    currentSkills: { type: [String], enum: [...CURRENT_SKILLS], required: true },
    primaryCareerGoal: { type: String, enum: [...PRIMARY_CAREER_GOALS], required: true },
    additionalNotes: { type: String, trim: true, maxlength: 500 },
    targetTimeline: { type: String, enum: [...TARGET_TIMELINES], required: true },
  },
  { timestamps: true, collection: "assessments" },
);

export const AssessmentModel: Model<AssessmentDocument> = model<AssessmentDocument>(
  "Assessment",
  assessmentSchema,
  "assessments",
);
