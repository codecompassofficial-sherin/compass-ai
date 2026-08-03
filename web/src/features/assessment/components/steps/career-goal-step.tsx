'use client'

import { SelectField } from '../form-fields'
import { CAREER_GOAL_OPTIONS, TIMELINE_OPTIONS } from '../../lib/options'

export function CareerGoalStep() {
  return (
    <div className="flex flex-col gap-6">
      <SelectField
        name="primaryCareerGoal"
        label="Primary career goal"
        description="The outcome that matters most to you right now."
        options={CAREER_GOAL_OPTIONS}
        columns={2}
      />
      <SelectField
        name="targetTimeline"
        label="Target timeline"
        description="When do you want to reach this goal?"
        options={TIMELINE_OPTIONS}
        columns={3}
      />
    </div>
  )
}
