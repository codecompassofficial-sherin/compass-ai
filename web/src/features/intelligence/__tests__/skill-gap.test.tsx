import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { SkillGap } from '@/features/intelligence/components/skill-gap'
import type { SkillGapAnalysis } from '@/features/intelligence/types/intelligence.types'

const skillGap: SkillGapAnalysis = {
  acquiredSkills: ['JavaScript', 'TypeScript'],
  missingSkills: ['Web Application Development'],
  recommendedSkills: ['Distributed Systems', 'Cloud Architecture'],
}

describe('SkillGap', () => {
  it('renders each skill inside a truncating span so long skills ellipsize instead of clipping', () => {
    render(<SkillGap skillGap={skillGap} />)

    const skills = [
      'JavaScript',
      'TypeScript',
      'Web Application Development',
      'Distributed Systems',
      'Cloud Architecture',
    ]

    for (const skill of skills) {
      expect(screen.getByText(skill)).toHaveClass('truncate')
    }
  })
})
