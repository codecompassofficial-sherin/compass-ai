export interface DashboardProfile {
  targetRole: string | null;
  experienceLevel: string | null;
  primaryCareerGoal: string | null;
}

export interface DashboardRoadmap {
  active: boolean;
  version: number;
  totalPhases: number;
  completedPhases: number;
  progress: number;
}

export interface DashboardGoals {
  totalGoals: number;
  draft: number;
  active: number;
  completed: number;
  progress: number;
}

export interface RecentProject {
  id: string;
  title: string;
  status: string;
}

export interface DashboardProjects {
  totalProjects: number;
  inProgress: number;
  completed: number;
  recent: RecentProject[];
}

export interface DashboardStatistics {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  totalProjects: number;
  completedProjects: number;
  roadmapProgress: number;
  currentPhase: string | null;
  currentGoal: string | null;
  accountCreatedAt: string;
}

export interface DashboardData {
  profile: DashboardProfile;
  roadmap: DashboardRoadmap | null;
  goals: DashboardGoals;
  projects: DashboardProjects;
  statistics: DashboardStatistics;
}

export interface GoalStatInput {
  id: string;
  phaseKey: string;
  order: number;
  status: string;
  title: string;
}

export interface PhaseStatInput {
  key: string;
  order: number;
}

export interface DashboardStatsInput {
  phases: PhaseStatInput[];
  goals: GoalStatInput[];
  totalProjects: number;
  completedProjects: number;
  accountCreatedAt: string;
}

export interface DashboardComputed {
  roadmap: DashboardRoadmap;
  goals: DashboardGoals;
  statistics: DashboardStatistics;
}

export const EMPTY_DASHBOARD_GOALS: DashboardGoals = {
  totalGoals: 0,
  draft: 0,
  active: 0,
  completed: 0,
  progress: 0,
};
