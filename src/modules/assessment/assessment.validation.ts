import { z } from "zod";
import {
  CURRENT_SKILLS,
  EXPERIENCE_LEVELS,
  PRIMARY_CAREER_GOALS,
  TARGET_ROLES,
  TARGET_TIMELINES,
  TECHNOLOGY_PREFERENCES,
} from "./assessment.constants.js";

function uniqueValues<T>(values: T[]): boolean {
  return new Set(values).size === values.length;
}

const targetRoleSchema = z.enum(TARGET_ROLES);
const experienceLevelSchema = z.enum(EXPERIENCE_LEVELS);
const technologyPreferencesSchema = z
  .array(z.enum(TECHNOLOGY_PREFERENCES))
  .min(1, "Select at least one preferred technology")
  .refine(uniqueValues, { message: "Technology preferences must be unique" });
const currentSkillsSchema = z
  .array(z.enum(CURRENT_SKILLS))
  .refine(uniqueValues, { message: "Skills must be unique" });
const primaryCareerGoalSchema = z.enum(PRIMARY_CAREER_GOALS);
const additionalNotesSchema = z
  .string()
  .trim()
  .min(1, "Additional notes must not be empty")
  .max(500, "Additional notes must be at most 500 characters")
  .optional();
const targetTimelineSchema = z.enum(TARGET_TIMELINES);

export const createAssessmentSchema = z.object({
  targetRole: targetRoleSchema,
  experienceLevel: experienceLevelSchema,
  technologyPreferences: technologyPreferencesSchema,
  currentSkills: currentSkillsSchema,
  primaryCareerGoal: primaryCareerGoalSchema,
  additionalNotes: additionalNotesSchema,
  targetTimeline: targetTimelineSchema,
});

export const updateAssessmentSchema = z
  .object({
    targetRole: targetRoleSchema.optional(),
    experienceLevel: experienceLevelSchema.optional(),
    technologyPreferences: technologyPreferencesSchema.optional(),
    currentSkills: currentSkillsSchema.optional(),
    primaryCareerGoal: primaryCareerGoalSchema.optional(),
    additionalNotes: additionalNotesSchema.optional(),
    targetTimeline: targetTimelineSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
