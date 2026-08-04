import type { GoalInstanceDocument } from "../roadmap/goalInstance.model.js";
import { dashboardRepository } from "./dashboard.repository.js";
import { computeEmptyStats, computeStats } from "./dashboard.stats.js";
import type { DashboardData, DashboardProfile, RecentProject } from "./dashboard.types.js";

function toProfile(assessment: Awaited<ReturnType<typeof dashboardRepository.findAssessment>>): DashboardProfile {
  if (!assessment) {
    return { targetRole: null, experienceLevel: null, primaryCareerGoal: null };
  }
  return {
    targetRole: assessment.targetRole,
    experienceLevel: assessment.experienceLevel,
    primaryCareerGoal: assessment.primaryCareerGoal,
  };
}

function toRecentProjects(projects: Awaited<ReturnType<typeof dashboardRepository.findProjects>>): RecentProject[] {
  return [...projects]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map((project) => ({
      id: project._id.toString(),
      title: project.title,
      status: project.status,
    }));
}

function toGoalStat(goal: GoalInstanceDocument) {
  return {
    id: goal._id.toString(),
    phaseKey: goal.phaseKey,
    order: goal.order,
    status: goal.status,
    title: goal.title,
  };
}

async function getDashboard(userId: string): Promise<DashboardData> {
  const user = await dashboardRepository.findUser(userId);
  const [assessment, roadmap, projects] = await Promise.all([
    dashboardRepository.findAssessment(userId),
    dashboardRepository.findActiveRoadmap(userId),
    dashboardRepository.findProjects(userId),
  ]);

  const profile = toProfile(assessment);
  const accountCreatedAt = user ? user.createdAt.toISOString() : new Date().toISOString();

  let roadmapBlock: DashboardData["roadmap"] = null;
  let goalsBlock: DashboardData["goals"];
  let statistics: DashboardData["statistics"];

  if (!roadmap) {
    const empty = computeEmptyStats(accountCreatedAt);
    goalsBlock = empty.goals;
    statistics = empty.statistics;
  } else {
    const goals = await dashboardRepository.findGoalsByRoadmapId(roadmap._id);
    const computed = computeStats({
      phases: roadmap.phases.map((phase) => ({ key: phase.key, order: phase.order })),
      goals: goals.map(toGoalStat),
      totalProjects: projects.length,
      completedProjects: projects.filter((project) => project.status === "completed").length,
      accountCreatedAt,
    });
    roadmapBlock = {
      active: roadmap.status === "active",
      version: roadmap.version,
      totalPhases: computed.roadmap.totalPhases,
      completedPhases: computed.roadmap.completedPhases,
      progress: computed.roadmap.progress,
    };
    goalsBlock = computed.goals;
    statistics = computed.statistics;
  }

  return {
    profile,
    roadmap: roadmapBlock,
    goals: goalsBlock,
    projects: {
      totalProjects: projects.length,
      inProgress: projects.filter((project) => project.status === "in_progress").length,
      completed: projects.filter((project) => project.status === "completed").length,
      recent: toRecentProjects(projects),
    },
    statistics,
  };
}

export const dashboardService = {
  get: getDashboard,
};
