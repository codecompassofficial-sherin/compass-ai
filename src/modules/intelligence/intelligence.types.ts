import type { TargetRole } from "../assessment/assessment.types.js";

export type NextBestActionCode =
  | "COMPLETE_ASSESSMENT"
  | "GENERATE_ROADMAP"
  | "ACTIVATE_GOAL"
  | "CONTINUE_GOAL"
  | "START_PROJECT"
  | "REGENERATE_ROADMAP";

export interface NextBestAction {
  action: NextBestActionCode;
  title: string;
  description: string;
  goalId?: string;
  projectTemplateKey?: string;
}

export interface SkillGapAnalysis {
  acquiredSkills: string[];
  missingSkills: string[];
  recommendedSkills: string[];
}

export type LearningPriority = "high" | "medium";

export interface LearningRecommendation {
  skill: string;
  goalKey: string;
  goalTitle: string;
  reason: string;
  priority: LearningPriority;
}

export interface ProjectRecommendation {
  templateKey: string;
  title: string;
  description: string;
  skillTargets: string[];
  estimatedEffortHours: number;
  reason: string;
}

export interface RoadmapInsights {
  overallProgress: number;
  totalGoals: number;
  completedGoals: number;
  remainingGoals: number;
  currentPhase: string | null;
  currentGoal: string | null;
  readinessSummary: string;
}

export interface IntelligenceData {
  nextBestAction: NextBestAction;
  skillGap: SkillGapAnalysis;
  learning: LearningRecommendation[];
  projects: ProjectRecommendation[];
  roadmap: RoadmapInsights;
}

export interface IntelligencePhaseInput {
  key: string;
  order: number;
}

export interface IntelligenceGoalInput {
  id: string;
  phaseKey: string;
  order: number;
  status: string;
  templateKey: string;
  title: string;
  skillTargets: string[];
}

export interface IntelligenceProjectInput {
  title: string;
  status: string;
}

export interface IntelligenceInput {
  hasAssessment: boolean;
  hasRoadmap: boolean;
  targetRole: TargetRole | null;
  currentSkills: string[];
  phases: IntelligencePhaseInput[];
  goals: IntelligenceGoalInput[];
  projects: IntelligenceProjectInput[];
}
