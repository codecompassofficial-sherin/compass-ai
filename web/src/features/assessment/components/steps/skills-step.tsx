'use client'

import { ChipField } from '../form-fields'
import { CURRENT_SKILLS } from '../../assessment.constants'

export function SkillsStep() {
  return (
    <ChipField
      name="currentSkills"
      label="Current skills"
      description="Add the skills you already have. This helps tailor your plan."
      options={CURRENT_SKILLS}
      optional
    />
  )
}
