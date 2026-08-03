'use client'

import { SelectField } from '../form-fields'
import { TARGET_ROLE_OPTIONS } from '../../lib/options'

export function TargetRoleStep() {
  return (
    <SelectField
      name="targetRole"
      label="Target role"
      description="Which role are you working toward? You can refine this later."
      options={TARGET_ROLE_OPTIONS}
      columns={2}
    />
  )
}
