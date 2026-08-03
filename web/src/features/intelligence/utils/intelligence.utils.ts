import type {
  IntelligenceData,
  IntelligenceStatus,
  LearningPriority,
  LearningRecommendation,
  RoadmapInsights,
  SkillGapAnalysis,
} from '../types/intelligence.types'

const PRIORITY_RANK: Record<LearningPriority, number> = {
  high: 0,
  medium: 1,
}

export function getIntelligenceStatus(data: IntelligenceData): IntelligenceStatus {
  if (data.nextBestAction.action === 'COMPLETE_ASSESSMENT') {
    return 'no-assessment'
  }
  if (data.nextBestAction.action === 'GENERATE_ROADMAP') {
    return 'no-roadmap'
  }

  const hasInsights =
    data.roadmap.totalGoals > 0 ||
    data.skillGap.acquiredSkills.length > 0 ||
    data.skillGap.missingSkills.length > 0 ||
    data.skillGap.recommendedSkills.length > 0 ||
    data.learning.length > 0 ||
    data.projects.length > 0

  return hasInsights ? 'ready' : 'empty'
}

export function getSkillGapSummary(skillGap: SkillGapAnalysis): {
  acquired: number
  missing: number
  recommended: number
} {
  return {
    acquired: skillGap.acquiredSkills.length,
    missing: skillGap.missingSkills.length,
    recommended: skillGap.recommendedSkills.length,
  }
}

export function getEffortLevel(hours: number): 'Light' | 'Moderate' | 'Extensive' {
  if (hours <= 8) {
    return 'Light'
  }
  if (hours <= 24) {
    return 'Moderate'
  }
  return 'Extensive'
}

export function getCareerStageLabel(roadmap: RoadmapInsights): string {
  if (roadmap.totalGoals === 0) {
    return 'Getting started'
  }
  if (roadmap.overallProgress >= 100) {
    return 'Ready for the next step'
  }
  if (roadmap.overallProgress >= 50) {
    return 'Building momentum'
  }
  return 'Laying foundations'
}

export function sortLearningByPriority(
  items: LearningRecommendation[]
): LearningRecommendation[] {
  return [...items].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
  )
}
