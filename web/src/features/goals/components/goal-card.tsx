'use client'

import { Clock3, ListChecks, Lock, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/feedback/loading'
import { cn } from '@/lib/utils'
import { GOAL_STATUS_META } from '@/features/roadmap/constants/roadmap.constants'
import { formatEffort } from '@/features/roadmap/utils/roadmap.utils'

import type { PublicGoal } from '../types/goals.types'

interface GoalCardProps {
  goal: PublicGoal
  selected: boolean
  onSelect: (id: string) => void
  onActivate: (goal: PublicGoal) => void
  activating: boolean
}

export function GoalCard({
  goal,
  selected,
  onSelect,
  onActivate,
  activating,
}: GoalCardProps) {
  const statusMeta = GOAL_STATUS_META[goal.status]
  const extraSkills = goal.skillTargets.slice(3).length

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={() => onSelect(goal.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(goal.id)
        }
      }}
      size="sm"
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        selected && 'border-primary bg-accent/40 ring-primary'
      )}
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading min-w-0 text-sm font-semibold tracking-tight">
            {goal.title}
          </h3>
          <Badge variant={statusMeta.variant} className="shrink-0">
            {statusMeta.label}
          </Badge>
        </div>

        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
          {goal.description}
        </p>

        {goal.skillTargets.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {goal.skillTargets.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="outline" className="h-5">
                {skill}
              </Badge>
            ))}
            {extraSkills > 0 && (
              <span className="text-muted-foreground text-xs">
                +{extraSkills} more
              </span>
            )}
          </div>
        )}

        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" />
            {formatEffort(goal.estimatedEffortHours)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ListChecks className="size-3.5" />
            {goal.taskCount} tasks
          </span>
          {goal.prerequisites.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Lock className="size-3.5" />
              {goal.prerequisites.length} prerequisite
              {goal.prerequisites.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Progress
              value={goal.progress}
              className="h-1.5 flex-1"
            />
            <span className="text-xs font-medium tabular-nums">
              {goal.progress}%
            </span>
          </div>

          {goal.status === 'draft' && (
            <Button
              size="sm"
              className="shrink-0"
              disabled={activating}
              onClick={(event) => {
                event.stopPropagation()
                onActivate(goal)
              }}
            >
              {activating ? (
                <>
                  <Spinner />
                  Activating…
                </>
              ) : (
                <>
                  <Sparkles />
                  Activate
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
