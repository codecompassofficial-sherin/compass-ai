import type { VariantProps } from 'class-variance-authority'

import { badgeVariants } from '@/components/ui/badge'

import type {
  GenerationReason,
  GoalInstanceStatus,
} from '../types/roadmap.types'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export interface GenerationReasonMeta {
  label: string
  description: string
}

export const GENERATION_REASON_META: Record<GenerationReason, GenerationReasonMeta> = {
  INITIAL: {
    label: 'Initial',
    description: 'Generated from your career assessment.',
  },
  MANUAL: {
    label: 'Manual',
    description: 'Regenerated on your request.',
  },
  ASSESSMENT_UPDATED: {
    label: 'Assessment updated',
    description: 'Regenerated after you updated your assessment.',
  },
  SYSTEM_UPDATE: {
    label: 'System update',
    description: 'Regenerated after an engine or catalog update.',
  },
}

export interface GoalStatusMeta {
  label: string
  variant: BadgeVariant
}

export const GOAL_STATUS_META: Record<GoalInstanceStatus, GoalStatusMeta> = {
  draft: { label: 'Not started', variant: 'outline' },
  active: { label: 'In progress', variant: 'default' },
  completed: { label: 'Completed', variant: 'secondary' },
}
