import { z } from 'zod'

import {
  CURRENT_SKILLS,
  EXPERIENCE_LEVELS,
  PRIMARY_CAREER_GOALS,
  TARGET_ROLES,
  TARGET_TIMELINES,
  TECHNOLOGY_PREFERENCES,
} from './assessment.constants'

function uniqueValues<T>(values: T[]): boolean {
  return new Set(values).size === values.length
}

export const assessmentFormSchema = z.object({
  targetRole: z.enum(TARGET_ROLES, {
    error: 'Choose the role you are targeting',
  }),
  experienceLevel: z.enum(EXPERIENCE_LEVELS, {
    error: 'Choose your experience level',
  }),
  technologyPreferences: z
    .array(z.enum(TECHNOLOGY_PREFERENCES))
    .min(1, 'Choose at least one technology preference')
    .refine(uniqueValues, { message: 'Technology preferences must be unique' }),
  currentSkills: z
    .array(z.enum(CURRENT_SKILLS))
    .refine(uniqueValues, { message: 'Skills must be unique' }),
  primaryCareerGoal: z.enum(PRIMARY_CAREER_GOALS, {
    error: 'Choose your primary career goal',
  }),
  additionalNotes: z
    .string()
    .trim()
    .max(500, 'Notes must be under 500 characters')
    .optional(),
  targetTimeline: z.enum(TARGET_TIMELINES, {
    error: 'Choose your target timeline',
  }),
})

export type AssessmentFormValues = z.infer<typeof assessmentFormSchema>

export type AssessmentFieldName = keyof AssessmentFormValues
