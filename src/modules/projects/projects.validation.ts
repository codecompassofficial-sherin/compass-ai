import { z } from "zod";
import { PROJECT_STATUSES } from "./projects.constants.js";

const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(200, "Title must be at most 200 characters");

const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Description must not be empty")
  .max(5000, "Description must be at most 5000 characters")
  .optional();

const technologyStackSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Technology names must not be empty")
      .max(50, "Technology names must be at most 50 characters"),
  )
  .min(1, "Add at least one technology")
  .optional();

const optionalUrlSchema = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .max(500, "URL must be at most 500 characters")
  .optional();

const relatedGoalIdsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Related goal ids must not be empty")
      .regex(/^[0-9a-fA-F]{24}$/, "Related goal ids must be valid ObjectIds"),
  )
  .optional();

const statusSchema = z.enum(PROJECT_STATUSES);

export const createProjectSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  technologyStack: technologyStackSchema,
  githubUrl: optionalUrlSchema,
  liveUrl: optionalUrlSchema,
  status: statusSchema.optional(),
  relatedGoalIds: relatedGoalIdsSchema,
});

export const updateProjectSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    technologyStack: technologyStackSchema,
    githubUrl: optionalUrlSchema,
    liveUrl: optionalUrlSchema,
    status: statusSchema.optional(),
    relatedGoalIds: relatedGoalIdsSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
