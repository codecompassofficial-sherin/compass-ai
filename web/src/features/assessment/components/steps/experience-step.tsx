'use client'

import { SelectField } from '../form-fields'
import { EXPERIENCE_LEVEL_OPTIONS } from '../../lib/options'

export function ExperienceStep() {
  return (
    <SelectField
      name="experienceLevel"
      label="Experience level"
      description="How would you describe your current experience today?"
      options={EXPERIENCE_LEVEL_OPTIONS}
      columns={2}
    />
  )
}
