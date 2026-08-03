import {
  ClipboardCheck,
  Flag,
  Layers,
  Rocket,
  Target,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { AssessmentFieldName } from '@/features/assessment/assessment.validation'

export interface WizardStep {
  id: string
  index: number
  title: string
  description: string
  fields: AssessmentFieldName[]
  icon: LucideIcon
}

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'target-role',
    index: 0,
    title: 'Target role',
    description: 'The role you are preparing for.',
    fields: ['targetRole'],
    icon: Target,
  },
  {
    id: 'experience-level',
    index: 1,
    title: 'Experience level',
    description: 'How you would describe your experience today.',
    fields: ['experienceLevel'],
    icon: Rocket,
  },
  {
    id: 'technology',
    index: 2,
    title: 'Technology preferences',
    description: 'The stacks you want to build with.',
    fields: ['technologyPreferences'],
    icon: Layers,
  },
  {
    id: 'current-skills',
    index: 3,
    title: 'Current skills',
    description: 'The skills you already have — add as many as apply.',
    fields: ['currentSkills'],
    icon: Wrench,
  },
  {
    id: 'career-goal',
    index: 4,
    title: 'Career goal',
    description: 'What you are working toward and your timeline.',
    fields: ['primaryCareerGoal', 'targetTimeline'],
    icon: Flag,
  },
  {
    id: 'review',
    index: 5,
    title: 'Review & notes',
    description: 'Add context and confirm your assessment.',
    fields: ['additionalNotes'],
    icon: ClipboardCheck,
  },
]

export const TOTAL_STEPS = WIZARD_STEPS.length

export function getWizardStep(id: string): WizardStep {
  return WIZARD_STEPS.find((step) => step.id === id) ?? WIZARD_STEPS[0]
}
