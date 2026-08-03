import { describe, expect, it } from 'vitest'

import type {
  IntelligenceData,
  LearningPriority,
  LearningRecommendation,
  ProjectRecommendation,
  RoadmapInsights,
  SkillGapAnalysis,
} from '@/features/intelligence/types/intelligence.types'
import {
  getCareerStageLabel,
  getEffortLevel,
  getIntelligenceStatus,
  getSkillGapSummary,
  sortLearningByPriority,
} from '@/features/intelligence/utils/intelligence.utils'

function skillGap(overrides: Partial<SkillGapAnalysis> = {}): SkillGapAnalysis {
  return {
    acquiredSkills: [],
    missingSkills: [],
    recommendedSkills: [],
    ...overrides,
  }
}

function roadmap(overrides: Partial<RoadmapInsights> = {}): RoadmapInsights {
  return {
    overallProgress: 0,
    totalGoals: 0,
    completedGoals: 0,
    remainingGoals: 0,
    currentPhase: null,
    currentGoal: null,
    readinessSummary: '',
    ...overrides,
  }
}

function project(
  overrides: Partial<ProjectRecommendation> = {}
): ProjectRecommendation {
  return {
    templateKey: 'template-1',
    title: 'Project',
    description: '',
    skillTargets: [],
    estimatedEffortHours: 8,
    reason: '',
    ...overrides,
  }
}

function data(overrides: Partial<IntelligenceData> = {}): IntelligenceData {
  return {
    nextBestAction: {
      action: 'START_PROJECT',
      title: 'Start a project',
      description: '',
    },
    skillGap: skillGap(),
    learning: [],
    projects: [],
    roadmap: roadmap(),
    ...overrides,
  }
}

describe('getIntelligenceStatus', () => {
  it('reports no-assessment when the next best action is COMPLETE_ASSESSMENT', () => {
    const d = data({
      nextBestAction: {
        action: 'COMPLETE_ASSESSMENT',
        title: 'Complete assessment',
        description: '',
      },
    })
    expect(getIntelligenceStatus(d)).toBe('no-assessment')
  })

  it('reports no-roadmap when the next best action is GENERATE_ROADMAP', () => {
    const d = data({
      nextBestAction: {
        action: 'GENERATE_ROADMAP',
        title: 'Generate roadmap',
        description: '',
      },
    })
    expect(getIntelligenceStatus(d)).toBe('no-roadmap')
  })

  it('reports empty when nothing meaningful exists yet', () => {
    expect(getIntelligenceStatus(data())).toBe('empty')
  })

  it('reports ready when any insight is present', () => {
    expect(
      getIntelligenceStatus(data({ roadmap: roadmap({ totalGoals: 3 }) }))
    ).toBe('ready')
    expect(
      getIntelligenceStatus(
        data({ skillGap: skillGap({ missingSkills: ['React'] }) })
      )
    ).toBe('ready')
    expect(
      getIntelligenceStatus(data({ projects: [project()] }))
    ).toBe('ready')
    expect(
      getIntelligenceStatus(data({ learning: [learningItem()] }))
    ).toBe('ready')
  })
})

function learningItem(
  overrides: Partial<LearningRecommendation> = {}
): LearningRecommendation {
  return {
    skill: 'React',
    goalKey: 'goal-1',
    goalTitle: 'Build with React',
    reason: '',
    priority: 'high',
    ...overrides,
  }
}

describe('getSkillGapSummary', () => {
  it('counts skills in each group', () => {
    const gap = skillGap({
      acquiredSkills: ['HTML', 'CSS'],
      missingSkills: ['TypeScript'],
      recommendedSkills: ['TypeScript'],
    })
    expect(getSkillGapSummary(gap)).toEqual({
      acquired: 2,
      missing: 1,
      recommended: 1,
    })
  })

  it('handles an empty skill gap', () => {
    expect(getSkillGapSummary(skillGap())).toEqual({
      acquired: 0,
      missing: 0,
      recommended: 0,
    })
  })
})

describe('getEffortLevel', () => {
  it('labels light effort', () => {
    expect(getEffortLevel(8)).toBe('Light')
  })

  it('labels moderate effort', () => {
    expect(getEffortLevel(24)).toBe('Moderate')
  })

  it('labels extensive effort', () => {
    expect(getEffortLevel(40)).toBe('Extensive')
  })
})

describe('getCareerStageLabel', () => {
  it('handles a roadmap with no goals', () => {
    expect(getCareerStageLabel(roadmap())).toBe('Getting started')
  })

  it('handles a completed roadmap', () => {
    expect(
      getCareerStageLabel(
        roadmap({ totalGoals: 2, completedGoals: 2, overallProgress: 100 })
      )
    ).toBe('Ready for the next step')
  })

  it('handles half-complete progress', () => {
    expect(
      getCareerStageLabel(
        roadmap({ totalGoals: 2, completedGoals: 1, overallProgress: 50 })
      )
    ).toBe('Building momentum')
  })

  it('handles early progress', () => {
    expect(
      getCareerStageLabel(
        roadmap({ totalGoals: 4, completedGoals: 1, overallProgress: 25 })
      )
    ).toBe('Laying foundations')
  })
})

describe('sortLearningByPriority', () => {
  function rec(skill: string, priority: LearningPriority): LearningRecommendation {
    return learningItem({ skill, priority })
  }

  it('orders high priority first and preserves relative order', () => {
    const items = [
      rec('a', 'medium'),
      rec('b', 'high'),
      rec('c', 'high'),
      rec('d', 'medium'),
    ]
    expect(sortLearningByPriority(items).map((item) => item.skill)).toEqual([
      'b',
      'c',
      'a',
      'd',
    ])
  })

  it('does not mutate the input array', () => {
    const items = [rec('a', 'medium'), rec('b', 'high')]
    sortLearningByPriority(items)
    expect(items.map((item) => item.skill)).toEqual(['a', 'b'])
  })
})
