'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Clock3, ListChecks, Play } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { GOAL_STATUS_META } from '@/features/roadmap/constants/roadmap.constants'
import { formatEffort } from '@/features/roadmap/utils/roadmap.utils'

import type { PublicGoal } from '../types/goals.types'
import {
  getActiveGoal,
  getFirstDraftGoal,
  getGoalsSummary,
  getTaskSummary,
} from '../utils/goals.utils'

interface GoalsHeaderProps {
  goals: PublicGoal[]
  onSelectGoal: (id: string) => void
}

export function GoalsHeader({ goals, onSelectGoal }: GoalsHeaderProps) {
  const activeGoal = getActiveGoal(goals)
  const draftGoal = getFirstDraftGoal(goals)
  const summary = getGoalsSummary(goals)
  const overallPercent =
    summary.total === 0 ? 0 : Math.round((summary.completed / summary.total) * 100)
  const allCompleted = summary.total > 0 && summary.completed === summary.total
  const activeTasks = activeGoal ? getTaskSummary(activeGoal.tasks) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Goals workspace
              </p>
              <h1 className="font-heading mt-1 text-2xl font-semibold tracking-tight">
                Execution workspace
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Break your roadmap into daily work and track every step.
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-muted-foreground text-xs font-medium">
                Overall progress
              </span>
              <span className="font-heading text-2xl font-semibold tabular-nums">
                {overallPercent}%
              </span>
              <span className="text-muted-foreground text-xs">
                {summary.completed} of {summary.total} goals complete
              </span>
            </div>
          </div>

          <Progress value={overallPercent} />

          <div className="flex flex-col gap-4 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            {activeGoal ? (
              <>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Current goal
                    </span>
                    <Badge
                      variant={GOAL_STATUS_META[activeGoal.status].variant}
                    >
                      {GOAL_STATUS_META[activeGoal.status].label}
                    </Badge>
                  </div>

                  <h2 className="font-heading mt-1 text-base font-semibold tracking-tight">
                    {activeGoal.title}
                  </h2>

                  <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      {formatEffort(activeGoal.estimatedEffortHours)} estimated
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ListChecks className="size-3.5" />
                      {activeGoal.taskCount} tasks
                    </span>
                    {activeTasks && (
                      <span>
                        {activeTasks.done} of {activeTasks.total} done
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex max-w-md items-center gap-2">
                    <Progress value={activeGoal.progress} className="flex-1" />
                    <span className="text-xs font-medium tabular-nums">
                      {activeGoal.progress}%
                    </span>
                  </div>
                </div>

                <Button
                  className="shrink-0"
                  onClick={() => onSelectGoal(activeGoal.id)}
                >
                  Continue goal
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Current goal
                  </span>
                  <h2 className="font-heading mt-1 text-base font-semibold tracking-tight">
                    {allCompleted ? 'All goals completed' : 'No active goal'}
                  </h2>
                  <p className="text-muted-foreground mt-1 max-w-md text-sm">
                    {allCompleted
                      ? 'Great work — every goal in your roadmap is done. Review your roadmap for what comes next.'
                      : 'Activate a goal to generate its task plan and start making progress.'}
                  </p>
                </div>

                {draftGoal ? (
                  <Button
                    className="shrink-0"
                    onClick={() => onSelectGoal(draftGoal.id)}
                  >
                    <Play />
                    Start first goal
                  </Button>
                ) : null}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
