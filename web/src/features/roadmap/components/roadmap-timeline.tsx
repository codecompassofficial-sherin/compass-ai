'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

import type { PublicRoadmap, RoadmapPhase } from '../types/roadmap.types'
import type { PublicGoalInstance } from '../types/roadmap.types'
import type { PhaseStatus } from '../utils/roadmap.utils'
import {
  computePhaseStatuses,
  getPhaseGoalCounts,
  groupGoalsByPhase,
} from '../utils/roadmap.utils'
import { GoalCard } from './goal-card'

interface RoadmapTimelineProps {
  roadmap: PublicRoadmap
}

export function RoadmapTimeline({ roadmap }: RoadmapTimelineProps) {
  const goalsByPhase = groupGoalsByPhase(roadmap.phases, roadmap.goals)
  const phaseStatuses = computePhaseStatuses(roadmap.phases, roadmap.goals)

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            Your roadmap
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Work through each phase in order. Expand a phase to see its goals.
          </p>
        </div>

        <ol className="relative flex flex-col gap-5">
          {roadmap.phases.map((phase, index) => (
            <PhaseRow
              key={phase.key}
              phase={phase}
              index={index}
              isLast={index === roadmap.phases.length - 1}
              status={phaseStatuses.get(phase.key) ?? 'upcoming'}
              goals={goalsByPhase.get(phase.key) ?? []}
            />
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}

interface PhaseRowProps {
  phase: RoadmapPhase
  index: number
  isLast: boolean
  status: PhaseStatus
  goals: PublicGoalInstance[]
}

function PhaseRow({ phase, index, isLast, status, goals }: PhaseRowProps) {
  const [open, setOpen] = useState(status === 'current')
  const isCompleted = status === 'completed'
  const isCurrent = status === 'current'
  const counts = getPhaseGoalCounts(goals)

  return (
    <li className="relative flex gap-4">
      <div className="flex flex-col items-center self-stretch">
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: index * 0.08,
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
          className={cn(
            'z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
            isCompleted && 'bg-primary text-primary-foreground',
            isCurrent &&
              'bg-primary text-primary-foreground ring-4 ring-primary/20',
            !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
          )}
        >
          {isCompleted ? (
            <Check className="size-4" />
          ) : (
            <span>{index + 1}</span>
          )}
        </motion.span>

        {!isLast && (
          <motion.span
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: index * 0.08, duration: 0.35, ease: 'easeOut' }}
            className={cn(
              'w-0.5 flex-1 origin-top',
              isCompleted ? 'bg-primary' : 'bg-border'
            )}
          />
        )}
      </div>

      <div className="min-w-0 flex-1 pb-1">
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 rounded-lg py-1.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-semibold tracking-tight">
                  {phase.name}
                </h3>
                {isCurrent && <Badge>In progress</Badge>}
                {isCompleted && <Badge variant="outline">Complete</Badge>}
              </div>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {phase.description}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-2">
              <span className="text-muted-foreground text-xs tabular-nums">
                {counts.completed}/{counts.total} goals
              </span>
              <ChevronDown
                className={cn(
                  'text-muted-foreground size-4 transition-transform duration-200',
                  open && 'rotate-180'
                )}
              />
            </span>
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-3">
            {goals.length > 0 ? (
              <div className="flex flex-col gap-3">
                {goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                No goals in this phase yet.
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </li>
  )
}
