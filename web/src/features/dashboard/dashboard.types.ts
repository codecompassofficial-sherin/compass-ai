export interface DashboardProfile {
  targetRole: string | null
  experienceLevel: string | null
  primaryCareerGoal: string | null
}

export interface DashboardRoadmap {
  active: boolean
  version: number
  totalPhases: number
  completedPhases: number
  progress: number
}

export interface DashboardGoals {
  totalGoals: number
  draft: number
  active: number
  completed: number
  progress: number
}

export interface RecentProject {
  id: string
  title: string
  status: string
}

export interface DashboardProjects {
  totalProjects: number
  inProgress: number
  completed: number
  recent: RecentProject[]
}

export interface DashboardStatistics {
  totalGoals: number
  completedGoals: number
  activeGoals: number
  totalProjects: number
  completedProjects: number
  roadmapProgress: number
  currentPhase: string | null
  currentGoal: string | null
  accountCreatedAt: string
}

export interface DashboardData {
  profile: DashboardProfile
  roadmap: DashboardRoadmap | null
  goals: DashboardGoals
  projects: DashboardProjects
  statistics: DashboardStatistics
}

export type NextBestActionCode =
  | 'COMPLETE_ASSESSMENT'
  | 'GENERATE_ROADMAP'
  | 'ACTIVATE_GOAL'
  | 'CONTINUE_GOAL'
  | 'START_PROJECT'
  | 'REGENERATE_ROADMAP'

export interface NextBestAction {
  action: NextBestActionCode
  title: string
  description: string
  goalId?: string
  projectTemplateKey?: string
}

export interface SkillGapAnalysis {
  acquiredSkills: string[]
  missingSkills: string[]
  recommendedSkills: string[]
}

export type LearningPriority = 'high' | 'medium'

export interface LearningRecommendation {
  skill: string
  goalKey: string
  goalTitle: string
  reason: string
  priority: LearningPriority
}

export interface ProjectRecommendation {
  templateKey: string
  title: string
  description: string
  skillTargets: string[]
  estimatedEffortHours: number
  reason: string
}

export interface RoadmapInsights {
  overallProgress: number
  totalGoals: number
  completedGoals: number
  remainingGoals: number
  currentPhase: string | null
  currentGoal: string | null
  readinessSummary: string
}

export interface IntelligenceData {
  nextBestAction: NextBestAction
  skillGap: SkillGapAnalysis
  learning: LearningRecommendation[]
  projects: ProjectRecommendation[]
  roadmap: RoadmapInsights
}

export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'archived'

export interface PublicProject {
  id: string
  title: string
  description?: string
  technologyStack: string[]
  githubUrl?: string
  liveUrl?: string
  status: ProjectStatus
  relatedGoalIds: string[]
  completedAt?: string
  createdAt: string
  updatedAt: string
}
