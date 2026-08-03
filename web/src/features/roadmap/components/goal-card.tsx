'use client'

import Link from 'next/link'
import { Clock3, Play, ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GOAL_STATUS_META } from '../constants/roadmap.constants'
import type { PublicGoalInstance } from '../types/roadmap.types'
import { formatEffort } from '../utils/roadmap.utils'

interface GoalCardProps {
  goal: PublicGoalInstance
}

export function GoalCard({ goal }: GoalCardProps) {
  const statusMeta = GOAL_STATUS_META[goal.status]
  const isCompleted = goal.status === 'completed'

  return (
    <Card size="sm" className="transition-all duration-200 hover:shadow-sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading min-w-0 text-sm font-semibold tracking-tight">
            {goal.title}
          </h3>
          <Badge variant={statusMeta.variant} className="shrink-0">
            {statusMeta.label}
          </Badge>
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          {goal.description}
        </p>

        {goal.skillTargets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {goal.skillTargets.map((skill) => (
              <Badge key={skill} variant="outline" className="h-5">
                {skill}
              </Badge>
            ))}
          </div>
        )}

        {goal.prerequisites.length > 0 && (
          <p className="text-muted-foreground text-xs">
            <span className="font-medium">Before this:</span>{' '}
            {goal.prerequisites.join(', ')}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
            <Clock3 className="size-3.5" />
            {formatEffort(goal.estimatedEffortHours)}
          </span>

          {isCompleted ? (
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
              Done
            </span>
          ) : (
            <Button
              size="sm"
              variant={goal.status === 'active' ? 'outline' : 'default'}
              render={<Link href="/goals" />}
            >
              {goal.status === 'active' ? (
                <>
                  Continue goal
                  <ArrowRight data-icon="inline-end" />
                </>
              ) : (
                <>
                  <Play />
                  Activate goal
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
