'use client'

import { useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  GitBranch,
  ListChecks,
  Sparkles,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/feedback/loading'
import { GOAL_STATUS_META } from '@/features/roadmap/constants/roadmap.constants'
import { formatDateTime, formatEffort } from '@/features/roadmap/utils/roadmap.utils'
import { toast } from 'sonner'

import { getGoalErrorDetails } from '../api/goals.api'
import { useGoal, useUpdateTaskStatus } from '../hooks/useGoals'
import type { PublicGoal, TaskStatus } from '../types/goals.types'
import { getTaskSummary } from '../utils/goals.utils'
import { TaskList } from './task-list'

interface GoalDetailPanelProps {
  goal: PublicGoal
  phaseName: string
  onActivate: (goal: PublicGoal) => void
  onComplete: (goal: PublicGoal) => void
  activating: boolean
}

export function GoalDetailPanel({
  goal,
  phaseName,
  onActivate,
  onComplete,
  activating,
}: GoalDetailPanelProps) {
  const detail = useGoal(goal.id)
  const updateTask = useUpdateTaskStatus()
  const display = detail.data?.goal ?? goal
  const statusMeta = GOAL_STATUS_META[display.status]
  const tasks = getTaskSummary(display.tasks)
  const [pendingTaskIds, setPendingTaskIds] = useState<Set<string>>(
    () => new Set<string>()
  )

  async function handleUpdateTaskStatus(taskId: string, status: TaskStatus) {
    setPendingTaskIds((current) => new Set(current).add(taskId))
    try {
      await updateTask.mutateAsync({ goalId: display.id, taskId, status })
      toast.success(status === 'done' ? 'Task completed' : 'Task started')
    } catch (err) {
      toast.error(getGoalErrorDetails(err))
    } finally {
      setPendingTaskIds((current) => {
        const next = new Set(current)
        next.delete(taskId)
        return next
      })
    }
  }

  return (
    <Card className="h-fit">
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-heading min-w-0 text-lg font-semibold tracking-tight">
              {display.title}
            </h2>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
              <Badge variant="ghost">{phaseName}</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium tabular-nums">
                {display.progress}%
              </span>
            </div>
            <Progress value={display.progress} />
            <p className="text-muted-foreground text-xs">
              {tasks.done} of {tasks.total} tasks complete
            </p>
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" />
              {formatEffort(display.estimatedEffortHours)} estimated
            </span>
            <span className="inline-flex items-center gap-1">
              <ListChecks className="size-3.5" />
              {display.taskCount} generated tasks
            </span>
          </div>
        </div>

        <CollapsibleSection title="Description" defaultOpen>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {display.description}
          </p>
        </CollapsibleSection>

        <CollapsibleSection
          title="Skills"
          defaultOpen={display.skillTargets.length > 0}
        >
          {display.skillTargets.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {display.skillTargets.map((skill) => (
                <Badge key={skill} variant="outline" className="h-5">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              No specific skill targets for this goal.
            </p>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Prerequisites"
          defaultOpen={display.prerequisites.length > 0}
        >
          {display.prerequisites.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {display.prerequisites.map((prerequisite) => (
                <li
                  key={prerequisite}
                  className="text-muted-foreground flex items-start gap-2 text-sm"
                >
                  <GitBranch className="mt-0.5 size-3.5 shrink-0" />
                  {prerequisite}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              This goal has no prerequisites.
            </p>
          )}
        </CollapsibleSection>

        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
            <Flag className="size-3.5" />
            Tasks
          </p>
          {display.tasks.length > 0 ? (
            <TaskList
              tasks={display.tasks}
              onUpdateStatus={handleUpdateTaskStatus}
              pendingTaskIds={pendingTaskIds}
            />
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center">
              <ListChecks className="text-muted-foreground size-5" />
              <div className="flex flex-col gap-1">
                <p className="font-heading text-sm font-medium tracking-tight">
                  No tasks yet
                </p>
                <p className="text-muted-foreground max-w-xs text-sm">
                  {display.status === 'draft'
                    ? 'Activate this goal and we will generate a step-by-step task plan for it.'
                    : 'This goal has no generated tasks yet.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <CollapsibleSection title="Timeline">
          <dl className="flex flex-col gap-2 text-sm">
            <TimelineRow
              label="Created"
              value={formatDateTime(display.createdAt)}
            />
            {display.activatedAt && (
              <TimelineRow
                label="Activated"
                value={formatDateTime(display.activatedAt)}
              />
            )}
            {display.completedAt && (
              <TimelineRow
                label="Completed"
                value={formatDateTime(display.completedAt)}
              />
            )}
          </dl>
        </CollapsibleSection>

        <div className="mt-1 flex flex-col gap-2">
          {display.status === 'draft' && (
            <Button
              className="w-full"
              disabled={activating}
              onClick={() => onActivate(display)}
            >
              {activating ? (
                <>
                  <Spinner />
                  Activating…
                </>
              ) : (
                <>
                  <Sparkles />
                  Activate goal
                </>
              )}
            </Button>
          )}

          {display.status === 'active' && (
            <Button className="w-full" onClick={() => onComplete(display)}>
              <CheckCircle2 />
              Complete goal
            </Button>
          )}

          {display.status === 'completed' && (
            <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
              <CalendarDays className="size-3.5" />
              Completed {display.completedAt ? formatDateTime(display.completedAt) : '—'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
          {title}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-border h-px w-8 transition-colors group-hover:bg-muted-foreground/30" />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  )
}
