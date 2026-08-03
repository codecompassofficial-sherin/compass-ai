'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { Map, Target } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/empty-state'
import { isNoActiveRoadmap } from '@/features/roadmap/utils/roadmap.utils'
import { useActiveRoadmap } from '@/features/roadmap/hooks/useActiveRoadmap'

import { getGoalErrorDetails } from '../api/goals.api'
import { CompleteGoalDialog } from '../dialogs/complete-goal-dialog'
import { useActivateGoal, useGoals } from '../hooks/useGoals'
import type { PublicGoal } from '../types/goals.types'
import { getActiveGoal, getPhaseName } from '../utils/goals.utils'
import { GoalDetailPanel } from './goal-detail-panel'
import { GoalList } from './goal-list'
import { GoalsError } from './goals-error'
import { GoalsHeader } from './goals-header'
import { GoalsSkeleton } from './goals-skeleton'

export function GoalsPage() {
  const roadmap = useActiveRoadmap()
  const goalsQuery = useGoals()
  const activate = useActivateGoal()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [completeGoal, setCompleteGoal] = useState<PublicGoal | null>(null)
  const detailRef = useRef<HTMLDivElement>(null)

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id)
    if (window.matchMedia('(max-width: 1023px)').matches) {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  if (roadmap.isPending) {
    return <GoalsSkeleton />
  }

  if (isNoActiveRoadmap(roadmap.error)) {
    return (
      <EmptyState
        icon={Map}
        title="No active roadmap"
        description="Generate a roadmap from your assessment, then work through its goals here."
        action={
          <Button size="sm" render={<Link href="/roadmaps" />}>
            Go to roadmaps
          </Button>
        }
      />
    )
  }

  if (roadmap.isError || !roadmap.data) {
    return (
      <GoalsError
        error={roadmap.error}
        onRetry={() => void roadmap.refetch()}
      />
    )
  }

  const phases = roadmap.data.roadmap.phases
  const goals = goalsQuery.data?.goals ?? []

  if (goalsQuery.isPending) {
    return <GoalsSkeleton />
  }

  if (goalsQuery.isError || !goalsQuery.data) {
    return (
      <GoalsError
        error={goalsQuery.error}
        onRetry={() => void goalsQuery.refetch()}
      />
    )
  }

  const activeGoal = getActiveGoal(goals)
  const selected =
    goals.find((goal) => goal.id === selectedId) ??
    activeGoal ??
    goals[0] ??
    null

  async function handleActivate(goal: PublicGoal) {
    setActivatingId(goal.id)
    try {
      await activate.mutateAsync(goal.id)
      toast.success('Goal activated')
      setSelectedId(goal.id)
    } catch (err) {
      toast.error(getGoalErrorDetails(err))
    } finally {
      setActivatingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <GoalsHeader goals={goals} onSelectGoal={handleSelect} />

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Your roadmap has no goals. Regenerate your roadmap to get a fresh plan."
          action={
            <Button size="sm" render={<Link href="/roadmaps" />}>
              View roadmap
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <GoalList
              phases={phases}
              goals={goals}
              selectedId={selected?.id ?? null}
              onSelect={handleSelect}
              onActivate={handleActivate}
              activatingId={activatingId}
            />
          </div>

          <div ref={detailRef} className="lg:col-span-2">
            <div className="lg:sticky lg:top-6">
              <GoalDetailPanel
                goal={selected as PublicGoal}
                phaseName={getPhaseName(phases, selected?.phaseKey ?? '')}
                onActivate={handleActivate}
                onComplete={setCompleteGoal}
                activating={activatingId === selected?.id}
              />
            </div>
          </div>
        </div>
      )}

      <CompleteGoalDialog
        goal={completeGoal}
        open={completeGoal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCompleteGoal(null)
          }
        }}
      />
    </div>
  )
}
