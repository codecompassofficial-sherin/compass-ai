import { BookOpen } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/feedback/empty-state'

import { LEARNING_PRIORITY_META } from '../constants/intelligence.constants'
import type { LearningRecommendation } from '../types/intelligence.types'
import { sortLearningByPriority } from '../utils/intelligence.utils'

interface LearningRecommendationsProps {
  learning: LearningRecommendation[]
}

export function LearningRecommendations({
  learning,
}: LearningRecommendationsProps) {
  const items = sortLearningByPriority(learning)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="text-muted-foreground size-4" />
          Learning recommendations
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Skills to study next, tied to your goals.
        </p>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <Card key={`${item.goalKey}-${item.skill}`} size="sm">
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate text-sm font-medium">
                      {item.skill}
                    </p>
                    <Badge
                      variant={LEARNING_PRIORITY_META[item.priority].variant}
                      className="shrink-0"
                    >
                      {LEARNING_PRIORITY_META[item.priority].label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">{item.reason}</p>
                  <p className="text-muted-foreground text-xs">
                    Related goal:{' '}
                    <span className="text-foreground">{item.goalTitle}</span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No learning recommendations yet"
            description="Recommendations appear as your roadmap skills come into focus."
            className="px-4 py-8"
          />
        )}
      </CardContent>
    </Card>
  )
}
