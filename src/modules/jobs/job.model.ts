import { Schema, model } from "mongoose";
import type { Model, Types } from "mongoose";
import { JOB_SOURCES } from "./job.constants.js";
import type { JobSource } from "./job.types.js";

export interface JobDocument {
  _id: Types.ObjectId;
  source: JobSource;
  sourceId: string;
  title: string;
  company: string;
  description: string;
  summary?: string;
  location?: string;
  isRemote: boolean;
  url: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  employmentType?: string;
  seniority?: string;
  skills: string[];
  tags: string[];
  postedAt?: Date;
  fetchedAt: Date;
  normalizedHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<JobDocument>(
  {
    source: { type: String, enum: [...JOB_SOURCES], required: true },
    sourceId: { type: String, required: true, maxlength: 500 },
    title: { type: String, required: true, trim: true, maxlength: 500 },
    company: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, required: true, maxlength: 50_000 },
    summary: { type: String, trim: true, maxlength: 1_000 },
    location: { type: String, trim: true, maxlength: 300 },
    isRemote: { type: Boolean, required: true, default: false },
    url: { type: String, required: true, maxlength: 2_000 },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryCurrency: { type: String, trim: true, maxlength: 10 },
    employmentType: { type: String, trim: true, maxlength: 50 },
    seniority: { type: String, trim: true, maxlength: 50 },
    skills: { type: [String], required: true, default: [] },
    tags: { type: [String], required: true, default: [] },
    postedAt: { type: Date },
    fetchedAt: { type: Date, required: true },
    normalizedHash: { type: String, required: true, maxlength: 500 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true, collection: "jobs" },
);

jobSchema.index({ source: 1, sourceId: 1 }, { unique: true });
jobSchema.index({ normalizedHash: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ isActive: 1, fetchedAt: -1 });
jobSchema.index({ company: 1 });

export const JobModel: Model<JobDocument> = model<JobDocument>(
  "Job",
  jobSchema,
  "jobs",
);
