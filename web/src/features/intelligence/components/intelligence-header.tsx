'use client'

import { motion } from 'framer-motion'
import { Map, RefreshCw, Sparkles, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getPhaseName } from '@/features/dashboard/lib/phases'
import { formatDateTime } from '@/features/roadmap/utils/roadmap.utils'
import { cn } from '@/lib/utils'

import type { IntelligenceData } from '../types/intelligence.types'
import { getCareerStageLabel } from '../utils/intelligence.utils'

interface IntelligenceHeaderProps {
  intelligence: IntelligenceData
  lastUpdated: string | null
  refreshing: boolean
  onRefresh: () => void
}

export function IntelligenceHeader({
  intelligence,
  lastUpdated,
  refreshing,
  onRefresh,
}: IntelligenceHeaderProps) {
  const { nextBestAction, roadmap } = intelligence
  const stage = getCareerStageLabel(roadmap)
  const phaseName = getPhaseName(roadmap.currentPhase)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Career intelligence
              </p>
              <h1 className="font-heading mt-1 text-2xl font-semibold tracking-tight">
                Your career at a glance
              </h1>
              <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
                {roadmap.readinessSummary}
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              {lastUpdated && (
                <p className="text-muted-foreground text-xs">
                  Updated {formatDateTime(lastUpdated)}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn(refreshing && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge className="max-w-sm justify-start gap-1">
              <Sparkles className="shrink-0" />
              <span className="truncate">
                Recommended next: {nextBestAction.title}
              </span>
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="shrink-0" />
              {stage}
            </Badge>
            {phaseName && (
              <Badge variant="outline" className="gap-1">
                <Map className="shrink-0" />
                {phaseName}
              </Badge>
            )}
            {roadmap.currentGoal && (
              <Badge variant="outline" className="max-w-[18rem] justify-start gap-1">
                <span className="truncate">{roadmap.currentGoal}</span>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
