import { EMPTY_DASHBOARD_GOALS } from "./dashboard.types.js";
import type {
  DashboardComputed,
  DashboardStatsInput,
  GoalStatInput,
  PhaseStatInput,
} from "./dashboard.types.js";

function percent(completed: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((completed / total) * 100);
}

function goalsByPhase(
  phases: PhaseStatInput[],
  goals: GoalStatInput[],
): Map<string, GoalStatInput[]> {
  const phaseOrder = new Map(phases.map((phase) => [phase.key, phase.order]));
  const sorted = [...goals].sort(
    (a, b) =>
      (phaseOrder.get(a.phaseKey) ?? Number.MAX_SAFE_INTEGER) -
        (phaseOrder.get(b.phaseKey) ?? Number.MAX_SAFE_INTEGER) || a.order - b.order,
  );
  const grouped = new Map<string, GoalStatInput[]>();
  for (const goal of sorted) {
    const current = grouped.get(goal.phaseKey) ?? [];
    current.push(goal);
    grouped.set(goal.phaseKey, current);
  }
  return grouped;
}

export function computeRoadmap(
  phases: PhaseStatInput[],
  goals: GoalStatInput[],
): DashboardComputed["roadmap"] {
  if (phases.length === 0) {
    return { active: true, version: 1, totalPhases: 0, completedPhases: 0, progress: 0 };
  }
  const grouped = goalsByPhase(phases, goals);
  let completedPhases = 0;
  for (const phase of phases) {
    const phaseGoals = grouped.get(phase.key) ?? [];
    if (phaseGoals.length > 0 && phaseGoals.every((goal) => goal.status === "completed")) {
      completedPhases += 1;
    }
  }
  return {
    active: true,
    version: 1,
    totalPhases: phases.length,
    completedPhases,
    progress: percent(completedPhases, phases.length),
  };
}

export function computeCurrentPhaseAndGoal(
  phases: PhaseStatInput[],
  goals: GoalStatInput[],
): { currentPhase: string | null; currentGoal: string | null } {
  if (phases.length === 0 || goals.length === 0) {
    return { currentPhase: null, currentGoal: null };
  }
  const grouped = goalsByPhase(phases, goals);
  for (const phase of phases) {
    const phaseGoals = grouped.get(phase.key);
    if (!phaseGoals || phaseGoals.length === 0) {
      continue;
    }
    const activeGoal = phaseGoals.find((goal) => goal.status === "active");
    if (activeGoal) {
      return { currentPhase: phase.key, currentGoal: activeGoal.title };
    }
    const nextGoal = phaseGoals.find((goal) => goal.status === "draft");
    if (nextGoal) {
      return { currentPhase: phase.key, currentGoal: nextGoal.title };
    }
  }
  return { currentPhase: null, currentGoal: null };
}

export function computeStats(input: DashboardStatsInput): DashboardComputed {
  const goals = input.goals;
  const goalCounts = {
    totalGoals: goals.length,
    draft: goals.filter((goal) => goal.status === "draft").length,
    active: goals.filter((goal) => goal.status === "active").length,
    completed: goals.filter((goal) => goal.status === "completed").length,
  };
  const roadmap = computeRoadmap(input.phases, input.goals);
  const current = computeCurrentPhaseAndGoal(input.phases, input.goals);

  return {
    roadmap,
    goals: {
      ...goalCounts,
      progress: percent(goalCounts.completed, goals.length),
    },
    statistics: {
      totalGoals: goalCounts.totalGoals,
      completedGoals: goalCounts.completed,
      activeGoals: goalCounts.active,
      totalProjects: input.totalProjects,
      completedProjects: input.completedProjects,
      roadmapProgress: roadmap.progress,
      currentPhase: current.currentPhase,
      currentGoal: current.currentGoal,
      accountCreatedAt: input.accountCreatedAt,
    },
  };
}

export function computeEmptyStats(accountCreatedAt: string): DashboardComputed {
  return {
    roadmap: { active: true, version: 1, totalPhases: 0, completedPhases: 0, progress: 0 },
    goals: { ...EMPTY_DASHBOARD_GOALS },
    statistics: {
      totalGoals: 0,
      completedGoals: 0,
      activeGoals: 0,
      totalProjects: 0,
      completedProjects: 0,
      roadmapProgress: 0,
      currentPhase: null,
      currentGoal: null,
      accountCreatedAt,
    },
  };
}
