'use client'

import { CheckCircle2, Circle, CircleDot, Clock3 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatEffort } from '@/features/roadmap/utils/roadmap.utils'

import { TASK_STATUS_META } from '../constants/goals.constants'
import type { PublicTask } from '../types/goals.types'

interface TaskListProps {
  tasks: PublicTask[]
}

function TaskStatusIcon({ status }: { status: PublicTask['status'] }) {
  if (status === 'done') {
    return <CheckCircle2 className="text-primary size-4 shrink-0" />
  }
  if (status === 'in_progress') {
    return <CircleDot className="text-primary size-4 shrink-0" />
  }
  return <Circle className="text-muted-foreground size-4 shrink-0" />
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task) => {
        const meta = TASK_STATUS_META[task.status]
        const isDone = task.status === 'done'

        return (
          <li
            key={task.id}
            className={cn(
              'flex gap-3 rounded-lg border px-3 py-2.5',
              isDone && 'bg-muted/40'
            )}
          >
            <span className="mt-0.5 flex shrink-0 items-center">
              <TaskStatusIcon status={task.status} />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isDone && 'text-muted-foreground line-through'
                  )}
                >
                  <span className="text-muted-foreground mr-2 text-xs font-normal tabular-nums">
                    {task.order}.
                  </span>
                  {task.title}
                </p>
                <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1 text-xs">
                  <Clock3 className="size-3" />
                  {formatEffort(task.estimatedEffortHours)}
                </span>
              </div>
              <p
                className={cn(
                  'text-muted-foreground mt-0.5 text-xs',
                  isDone && 'opacity-60'
                )}
              >
                {task.description}
              </p>
            </div>

            <Badge
              variant={meta.variant}
              className="mt-0.5 shrink-0 self-start"
            >
              {meta.label}
            </Badge>
          </li>
        )
      })}
    </ul>
  )
}
