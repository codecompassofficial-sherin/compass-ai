'use client'

import Link from 'next/link'
import { Flag } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'

import { badgeVariants } from '@/components/ui/badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/feedback/empty-state'
import { Progress } from '@/components/ui/progress'
import type {
  DashboardGoals,
  DashboardStatistics,
  NextBestAction,
} from '@/features/dashboard/dashboard.types'
import { getNextBestActionMeta } from '@/features/dashboard/lib/actions'
import { getPhaseName } from '@/features/dashboard/lib/phases'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

interface CurrentGoalCardProps {
  goals: DashboardGoals
  statistics: DashboardStatistics
  nextBestAction: NextBestAction
}

interface GoalStatus {
  label: string
  variant: BadgeVariant
}

function getGoalStatus(goals: DashboardGoals): GoalStatus | null {
  if (goals.totalGoals === 0) {
    return null
  }
  if (goals.completed === goals.totalGoals) {
    return { label: 'Complete', variant: 'secondary' }
  }
  if (goals.active > 0) {
    return { label: 'In progress', variant: 'default' }
  }
  if (goals.draft > 0) {
    return { label: 'Not started', variant: 'outline' }
  }
  return { label: 'Paused', variant: 'ghost' }
}

export function CurrentGoalCard({
  goals,
  statistics,
  nextBestAction,
}: CurrentGoalCardProps) {
  const status = getGoalStatus(goals)
  const phase = getPhaseName(statistics.currentPhase)
  const action = getNextBestActionMeta(nextBestAction.action)

  const goalIsFocused =
    nextBestAction.action === 'ACTIVATE_GOAL' ||
    nextBestAction.action === 'CONTINUE_GOAL'

  const headline = goalIsFocused
    ? nextBestAction.title
    : status?.label === 'Complete'
      ? 'All goals complete'
      : 'No goal in progress'

  const description = goalIsFocused
    ? nextBestAction.description
    : 'Your roadmap defines the goals that track your progress.'

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Flag className="text-muted-foreground size-4" />
            Current Goal
          </span>
          {status && <Badge variant={status.variant}>{status.label}</Badge>}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        {goals.totalGoals === 0 ? (
          <EmptyState
            icon={Flag}
            title="No goals yet"
            description="Your roadmap will define your first learning goals."
            className="px-4 py-8"
            action={
              <Button size="sm" render={<Link href={action.href} />}>
                {action.label}
              </Button>
            }
          />
        ) : (
          <>
            <div className="min-w-0">
              <p className="font-heading text-sm font-medium">{headline}</p>
              {phase && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Phase: {phase}
                </p>
              )}
              <p className="text-muted-foreground mt-1 text-xs">
                {description}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Goal progress</span>
                <span className="font-medium tabular-nums">
                  {goals.progress}%
                </span>
              </div>
              <Progress value={goals.progress} />
              <p className="text-muted-foreground text-xs">
                {goals.completed} of {goals.totalGoals} goals complete
              </p>
            </div>

            <div className="mt-auto">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                render={<Link href={action.href} />}
              >
                {action.label}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
