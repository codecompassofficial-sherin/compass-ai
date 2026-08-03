import { Map, Target } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPhaseName } from '@/features/dashboard/lib/phases'

import type { RoadmapInsights as RoadmapInsightsData } from '../types/intelligence.types'
import { ProgressRing } from './progress-ring'

interface RoadmapInsightsProps {
  roadmap: RoadmapInsightsData
}

export function RoadmapInsights({ roadmap }: RoadmapInsightsProps) {
  const phaseName = getPhaseName(roadmap.currentPhase)

  return (
    <Card className="h-fit lg:sticky lg:top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="text-muted-foreground size-4" />
          Roadmap insights
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Your progress across the whole plan.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center gap-5">
          <ProgressRing value={roadmap.overallProgress} />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-xs">
                Goals completed
              </span>
              <span className="font-heading text-lg font-semibold tabular-nums">
                {roadmap.completedGoals}
                <span className="text-muted-foreground text-sm font-normal">
                  {' '}
                  of {roadmap.totalGoals}
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-xs">Remaining</span>
              <span className="font-heading text-lg font-semibold tabular-nums">
                {roadmap.remainingGoals}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
              <Map className="size-3" />
              Current phase
            </span>
            <span className="min-w-0 truncate text-right text-sm font-medium">
              {phaseName ?? '—'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
              <Target className="size-3" />
              Current goal
            </span>
            <span className="min-w-0 truncate text-right text-sm font-medium">
              {roadmap.currentGoal ?? '—'}
            </span>
          </div>
        </div>

        <p className="text-muted-foreground border-t pt-4 text-xs">
          {roadmap.readinessSummary}
        </p>
      </CardContent>
    </Card>
  )
}
