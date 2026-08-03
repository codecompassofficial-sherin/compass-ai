import type { VariantProps } from 'class-variance-authority'

import { badgeVariants } from '@/components/ui/badge'

import type { ProjectStatus } from '../types/projects.types'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export interface ProjectStatusMeta {
  label: string
  variant: BadgeVariant
  description: string
}

export const PROJECT_STATUS_META: Record<ProjectStatus, ProjectStatusMeta> = {
  planned: {
    label: 'Planned',
    variant: 'outline',
    description: 'Ideated but not started yet',
  },
  in_progress: {
    label: 'In progress',
    variant: 'default',
    description: 'Actively being built',
  },
  completed: {
    label: 'Completed',
    variant: 'secondary',
    description: 'Built, shipped and finished',
  },
  archived: {
    label: 'Archived',
    variant: 'ghost',
    description: 'Removed from the active list',
  },
}

export const PROJECT_STATUS_ORDER: Record<ProjectStatus, number> = {
  planned: 0,
  in_progress: 1,
  completed: 2,
  archived: 3,
}

export const PROJECT_STATUS_TRANSITIONS: Readonly<
  Record<ProjectStatus, readonly ProjectStatus[]>
> = {
  planned: ['in_progress', 'archived'],
  in_progress: ['completed', 'archived'],
  completed: ['archived'],
  archived: [],
}

export const PROJECT_STATUS_FILTERS = [
  'all',
  'planned',
  'in_progress',
  'completed',
  'archived',
] as const

export type ProjectStatusFilter = (typeof PROJECT_STATUS_FILTERS)[number]

export const PROJECT_STATUS_FILTER_META: Record<
  ProjectStatusFilter,
  { label: string }
> = {
  all: { label: 'All' },
  planned: { label: 'Planned' },
  in_progress: { label: 'In progress' },
  completed: { label: 'Completed' },
  archived: { label: 'Archived' },
}
