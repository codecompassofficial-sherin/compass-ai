import type { VariantProps } from 'class-variance-authority'

import { badgeVariants } from '@/components/ui/badge'

import type { TaskStatus } from '../types/goals.types'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export interface TaskStatusMeta {
  label: string
  variant: BadgeVariant
  description: string
}

export const TASK_STATUS_META: Record<TaskStatus, TaskStatusMeta> = {
  todo: {
    label: 'To do',
    variant: 'outline',
    description: 'Not started yet',
  },
  in_progress: {
    label: 'In progress',
    variant: 'default',
    description: 'Actively being worked on',
  },
  done: {
    label: 'Done',
    variant: 'secondary',
    description: 'Completed',
  },
}

export const TASK_STATUS_ORDER: Record<TaskStatus, number> = {
  todo: 0,
  in_progress: 1,
  done: 2,
}
