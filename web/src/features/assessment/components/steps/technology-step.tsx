'use client'

import { ChipField } from '../form-fields'
import { TECHNOLOGY_PREFERENCES } from '../../assessment.constants'

export function TechnologyStep() {
  return (
    <ChipField
      name="technologyPreferences"
      label="Technology preferences"
      description="Choose at least one stack you want to build with."
      options={TECHNOLOGY_PREFERENCES}
    />
  )
}
