import type { VariantProps } from 'class-variance-authority'

import { badgeVariants } from '@/components/ui/badge'
import type { ProjectStatus } from '@/features/dashboard/dashboard.types'

type BadgeVariant = VariantProps<typeof badgeVariants>['variant']

export interface ProjectStatusMeta {
  label: string
  badgeVariant: NonNullable<BadgeVariant>
  progress: number | null
}

const PROJECT_STATUS_META: Record<ProjectStatus, ProjectStatusMeta> = {
  planned: { label: 'Planned', badgeVariant: 'outline', progress: 0 },
  in_progress: {
    label: 'In progress',
    badgeVariant: 'default',
    progress: null,
  },
  completed: {
    label: 'Completed',
    badgeVariant: 'secondary',
    progress: 100,
  },
  archived: { label: 'Archived', badgeVariant: 'ghost', progress: 0 },
}

export function getProjectStatusMeta(status: ProjectStatus): ProjectStatusMeta {
  return PROJECT_STATUS_META[status] ?? PROJECT_STATUS_META.planned
}

export function sortProjectsByRecency<T extends { createdAt: string }>(
  projects: T[]
): T[] {
  return [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
