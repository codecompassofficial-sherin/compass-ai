'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { RoadmapPhase } from '@/features/roadmap/types/roadmap.types'
import {
  computePhaseStatuses,
  groupGoalsByPhase,
} from '@/features/roadmap/utils/roadmap.utils'

import type { PublicGoal } from '../types/goals.types'
import { GoalCard } from './goal-card'

interface GoalListProps {
  phases: RoadmapPhase[]
  goals: PublicGoal[]
  selectedId: string | null
  onSelect: (id: string) => void
  onActivate: (goal: PublicGoal) => void
  activatingId: string | null
}

export function GoalList({
  phases,
  goals,
  selectedId,
  onSelect,
  onActivate,
  activatingId,
}: GoalListProps) {
  const grouped = groupGoalsByPhase(phases, goals)
  const phaseStatuses = computePhaseStatuses(phases, goals)

  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              All goals
            </h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Select a goal to open its task plan.
            </p>
          </div>
          <Badge variant="outline" className="h-6">
            {goals.length} goals
          </Badge>
        </div>

        <div className="flex flex-col gap-4">
          {phases.map((phase) => (
            <PhaseSection
              key={phase.key}
              phase={phase}
              goals={grouped.get(phase.key) ?? []}
              defaultOpen={phaseStatuses.get(phase.key) === 'current'}
              selectedId={selectedId}
              onSelect={onSelect}
              onActivate={onActivate}
              activatingId={activatingId}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface PhaseSectionProps {
  phase: RoadmapPhase
  goals: PublicGoal[]
  defaultOpen: boolean
  selectedId: string | null
  onSelect: (id: string) => void
  onActivate: (goal: PublicGoal) => void
  activatingId: string | null
}

function PhaseSection({
  phase,
  goals,
  defaultOpen,
  selectedId,
  onSelect,
  onActivate,
  activatingId,
}: PhaseSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const completedCount = goals.filter(
    (goal) => goal.status === 'completed'
  ).length

  return (
    <div className="flex flex-col">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <div className="flex min-w-0 items-center gap-2">
            <span className="font-heading text-sm font-semibold tracking-tight">
              {phase.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {completedCount}/{goals.length} complete
            </span>
          </div>
          <ChevronDown
            className={cn(
              'text-muted-foreground size-4 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-2">
          {goals.length > 0 ? (
            <div className="flex flex-col gap-3">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  selected={goal.id === selectedId}
                  onSelect={onSelect}
                  onActivate={onActivate}
                  activating={activatingId === goal.id}
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground flex items-center gap-1.5 px-2 py-2 text-xs">
              <Check className="size-3.5" />
              No goals in this phase yet.
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
