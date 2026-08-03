'use client'

import { motion } from 'framer-motion'
import { CalendarDays, Flag, RefreshCw, Rocket, Target } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import { GENERATION_REASON_META } from '../constants/roadmap.constants'
import type { PublicRoadmap } from '../types/roadmap.types'
import {
  formatDateTime,
  getCompletedPhaseCount,
  getRoadmapProgress,
  getRoadmapTitle,
} from '../utils/roadmap.utils'

interface RoadmapHeroProps {
  roadmap: PublicRoadmap
  onRegenerate: () => void
}

export function RoadmapHero({ roadmap, onRegenerate }: RoadmapHeroProps) {
  const snapshot = roadmap.assessmentSnapshot
  const reasonMeta = GENERATION_REASON_META[roadmap.reason]
  const progress = getRoadmapProgress(roadmap.phases, roadmap.goals)
  const completedPhases = getCompletedPhaseCount(roadmap.phases, roadmap.goals)
  const completedGoals = roadmap.goals.filter(
    (goal) => goal.status === 'completed'
  ).length

  const chips = [
    { label: snapshot.targetRole, icon: Target },
    { label: snapshot.experienceLevel, icon: Rocket },
    { label: snapshot.primaryCareerGoal, icon: Flag },
    { label: snapshot.targetTimeline, icon: CalendarDays },
  ]

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
                Career roadmap
              </p>
              <h1 className="font-heading mt-1 text-2xl font-semibold tracking-tight">
                {getRoadmapTitle(roadmap)}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                v{roadmap.version} · Generated{' '}
                {formatDateTime(roadmap.generatedAt)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="outline">{reasonMeta.label}</Badge>
              <Badge variant="secondary">
                {roadmap.status === 'active' ? 'Active' : 'Archived'}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <Badge key={chip.label} variant="outline" className="h-6 gap-1">
                <chip.icon className="size-3" />
                {chip.label}
              </Badge>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall progress</span>
              <span className="font-medium tabular-nums">{progress}%</span>
            </div>
            <Progress value={progress} />
            <p className="text-muted-foreground text-xs">
              {completedPhases} of {roadmap.phases.length} phases complete ·{' '}
              {completedGoals} of {roadmap.goals.length} goals complete
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={onRegenerate}>
              Regenerate roadmap
              <RefreshCw data-icon="inline-end" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
