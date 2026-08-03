import type {
  PublicGoalInstance,
  PublicRoadmap,
  RoadmapPhase,
} from '../types/roadmap.types'

export type PhaseStatus = 'completed' | 'current' | 'upcoming'

export function groupGoalsByPhase(
  phases: RoadmapPhase[],
  goals: PublicGoalInstance[]
): Map<string, PublicGoalInstance[]> {
  const phaseOrder = new Map(phases.map((phase, index) => [phase.key, index]))
  const sorted = [...goals].sort(
    (a, b) =>
      (phaseOrder.get(a.phaseKey) ?? Number.MAX_SAFE_INTEGER) -
        (phaseOrder.get(b.phaseKey) ?? Number.MAX_SAFE_INTEGER) ||
      a.order - b.order
  )

  const grouped = new Map<string, PublicGoalInstance[]>()
  for (const goal of sorted) {
    const current = grouped.get(goal.phaseKey) ?? []
    current.push(goal)
    grouped.set(goal.phaseKey, current)
  }
  return grouped
}

export function getGoalsForPhase(
  phase: RoadmapPhase,
  grouped: Map<string, PublicGoalInstance[]>
): PublicGoalInstance[] {
  return grouped.get(phase.key) ?? []
}

function isPhaseCompleted(
  goals: PublicGoalInstance[]
): boolean {
  return goals.length > 0 && goals.every((goal) => goal.status === 'completed')
}

export function getCurrentPhaseKey(
  phases: RoadmapPhase[],
  grouped: Map<string, PublicGoalInstance[]>
): string | null {
  for (const phase of phases) {
    const phaseGoals = grouped.get(phase.key) ?? []
    if (phaseGoals.length > 0 && phaseGoals.some((goal) => goal.status !== 'completed')) {
      return phase.key
    }
  }
  return null
}

export function computePhaseStatuses(
  phases: RoadmapPhase[],
  goals: PublicGoalInstance[]
): Map<string, PhaseStatus> {
  const grouped = groupGoalsByPhase(phases, goals)
  const currentKey = getCurrentPhaseKey(phases, grouped)

  const statuses = new Map<string, PhaseStatus>()
  for (const phase of phases) {
    const phaseGoals = grouped.get(phase.key) ?? []
    if (isPhaseCompleted(phaseGoals)) {
      statuses.set(phase.key, 'completed')
    } else if (phase.key === currentKey) {
      statuses.set(phase.key, 'current')
    } else {
      statuses.set(phase.key, 'upcoming')
    }
  }
  return statuses
}

export function getCompletedPhaseCount(
  phases: RoadmapPhase[],
  goals: PublicGoalInstance[]
): number {
  const grouped = groupGoalsByPhase(phases, goals)
  return phases.filter((phase) => isPhaseCompleted(grouped.get(phase.key) ?? [])).length
}

export function getRoadmapProgress(
  phases: RoadmapPhase[],
  goals: PublicGoalInstance[]
): number {
  if (phases.length === 0) {
    return 0
  }
  return Math.round((getCompletedPhaseCount(phases, goals) / phases.length) * 100)
}

export function getPhaseGoalCounts(
  goals: PublicGoalInstance[]
): { completed: number; total: number } {
  return {
    completed: goals.filter((goal) => goal.status === 'completed').length,
    total: goals.length,
  }
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatEffort(hours: number): string {
  if (hours >= 8) {
    return `~${Math.round(hours / 8)} days`
  }
  return `${hours} hrs`
}

export function isNoActiveRoadmap(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'NO_ACTIVE_ROADMAP'
  )
}

export function isAssessmentRequiredError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'ROADMAP_ASSESSMENT_REQUIRED'
  )
}

export function getRoadmapTitle(roadmap: PublicRoadmap): string {
  return `${roadmap.assessmentSnapshot.targetRole} Roadmap`
}
