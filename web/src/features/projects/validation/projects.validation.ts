import { z } from 'zod'

import type { ProjectStatus } from '../types/projects.types'
import { PROJECT_STATUSES } from '../types/projects.types'

const titleSchema = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(200, 'Title must be at most 200 characters')

const descriptionSchema = z
  .string()
  .trim()
  .max(5000, 'Description must be at most 5000 characters')
  .optional()
  .transform((value) =>
    value === undefined || value === '' ? undefined : value
  )

const technologyStackSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, 'Technology names must not be empty')
      .max(50, 'Technology names must be at most 50 characters')
  )
  .min(1, 'Add at least one technology')

const optionalUrlSchema = z
  .union([
    z
      .string()
      .trim()
      .url('Must be a valid URL')
      .max(500, 'URL must be at most 500 characters'),
    z.literal(''),
  ])
  .optional()
  .transform((value) =>
    value === undefined || value === '' ? undefined : value
  )

const statusSchema = z.enum(PROJECT_STATUSES)

export const createProjectSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  technologyStack: technologyStackSchema,
  githubUrl: optionalUrlSchema,
  liveUrl: optionalUrlSchema,
  status: statusSchema,
})

export const updateProjectSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    technologyStack: technologyStackSchema.optional(),
    githubUrl: optionalUrlSchema,
    liveUrl: optionalUrlSchema,
    status: statusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

export const editProjectSchema = z.object({
  title: titleSchema.optional(),
  description: descriptionSchema,
  technologyStack: technologyStackSchema.optional(),
  githubUrl: optionalUrlSchema,
  liveUrl: optionalUrlSchema,
})

export type CreateProjectFormInput = z.input<typeof createProjectSchema>
export type CreateProjectFormOutput = z.output<typeof createProjectSchema>

export type EditProjectFormInput = z.input<typeof editProjectSchema>
export type EditProjectFormOutput = z.output<typeof editProjectSchema>

export interface CreateProjectPayload {
  title: string
  description?: string
  technologyStack: string[]
  githubUrl?: string
  liveUrl?: string
  status: ProjectStatus
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>
