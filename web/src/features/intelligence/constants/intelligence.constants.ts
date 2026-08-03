import type { VariantProps } from 'class-variance-authority'

import { badgeVariants } from '@/components/ui/badge'

import type {
  LearningPriority,
  NextBestActionCode,
} from '../types/intelligence.types'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export const INTELLIGENCE_QUERY_KEY = ['intelligence']

export interface LearningPriorityMeta {
  label: string
  variant: BadgeVariant
  description: string
}

export const LEARNING_PRIORITY_META: Record<
  LearningPriority,
  LearningPriorityMeta
> = {
  high: {
    label: 'High priority',
    variant: 'default',
    description: 'Focus on this first',
  },
  medium: {
    label: 'Medium priority',
    variant: 'secondary',
    description: 'Closes a gap in your roadmap',
  },
}

export const NEXT_BEST_ACTION_IMPACT: Record<NextBestActionCode, string> = {
  COMPLETE_ASSESSMENT: 'Unlocks your personalized career plan.',
  GENERATE_ROADMAP: 'Turns your assessment into a step-by-step roadmap.',
  ACTIVATE_GOAL: 'Kicks off your next roadmap goal.',
  CONTINUE_GOAL: 'Keeps momentum on your current goal.',
  START_PROJECT: 'Builds evidence of your skills in a real project.',
  REGENERATE_ROADMAP: 'Keeps your plan aligned as you grow.',
}
