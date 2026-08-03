import type {
  CurrentSkill,
  ExperienceLevel,
  PrimaryCareerGoal,
  TargetRole,
  TargetTimeline,
  TechnologyPreference,
} from "../assessment/assessment.types.js";

export const GENERATION_REASONS = [
  "INITIAL",
  "MANUAL",
  "ASSESSMENT_UPDATED",
  "SYSTEM_UPDATE",
] as const;

export type GenerationReason = (typeof GENERATION_REASONS)[number];

export const ROADMAP_STATUSES = ["active", "archived"] as const;
export type RoadmapStatus = (typeof ROADMAP_STATUSES)[number];

export const GOAL_INSTANCE_STATUSES = ["draft", "active", "completed"] as const;
export type GoalInstanceStatus = (typeof GOAL_INSTANCE_STATUSES)[number];

export interface AssessmentSnapshot {
  targetRole: TargetRole;
  experienceLevel: ExperienceLevel;
  technologyPreferences: TechnologyPreference[];
  currentSkills: CurrentSkill[];
  primaryCareerGoal: PrimaryCareerGoal;
  additionalNotes?: string;
  targetTimeline: TargetTimeline;
}

export interface RoadmapPhase {
  key: string;
  name: string;
  description: string;
  order: number;
}

export interface GoalBindings {
  technologyPreferences: TechnologyPreference[];
  currentSkills: CurrentSkill[];
}

export interface GeneratedGoal {
  phaseKey: string;
  order: number;
  templateKey: string;
  templateVersion: string;
  title: string;
  description: string;
  skillTargets: string[];
  prerequisites: string[];
  estimatedEffortHours: number;
  bindings: GoalBindings;
}

export interface GeneratedRoadmap {
  phases: RoadmapPhase[];
  goals: GeneratedGoal[];
}

export interface PublicGoalInstance {
  id: string;
  phaseKey: string;
  order: number;
  templateKey: string;
  templateVersion: string;
  title: string;
  description: string;
  skillTargets: string[];
  prerequisites: string[];
  estimatedEffortHours: number;
  bindings: GoalBindings;
  status: GoalInstanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublicRoadmap {
  id: string;
  version: number;
  status: RoadmapStatus;
  reason: GenerationReason;
  assessmentSnapshot: AssessmentSnapshot;
  phases: RoadmapPhase[];
  engineVersion: string;
  catalogVersion: string;
  generatedAt: string;
  goals: PublicGoalInstance[];
  createdAt: string;
  updatedAt: string;
}

export interface RoadmapHistoryEntry {
  id: string;
  version: number;
  status: RoadmapStatus;
  reason: GenerationReason;
  generatedAt: string;
}

export interface RoadmapDiff {
  fromVersion: number;
  toVersion: number;
  phaseStructureChanged: boolean;
  addedGoals: PublicGoalInstance[];
  removedGoals: PublicGoalInstance[];
  unchangedGoals: PublicGoalInstance[];
}
