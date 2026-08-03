'use client'

import { Pencil } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { AssessmentFormValues } from '../../assessment.validation'

interface ReviewStepProps {
  onEditStep: (stepIndex: number) => void
}

interface ReviewRow {
  label: string
  value: unknown
  stepIndex: number
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(' · ') : 'None added'
  }
  if (typeof value === 'string' && value.length > 0) {
    return value
  }
  return '—'
}

export function ReviewStep({ onEditStep }: ReviewStepProps) {
  const { watch } = useFormContext<AssessmentFormValues>()

  const rows: ReviewRow[] = [
    { label: 'Target role', value: watch('targetRole'), stepIndex: 0 },
    {
      label: 'Experience level',
      value: watch('experienceLevel'),
      stepIndex: 1,
    },
    {
      label: 'Technology preferences',
      value: watch('technologyPreferences'),
      stepIndex: 2,
    },
    { label: 'Current skills', value: watch('currentSkills'), stepIndex: 3 },
    {
      label: 'Career goal',
      value: watch('primaryCareerGoal'),
      stepIndex: 4,
    },
    { label: 'Target timeline', value: watch('targetTimeline'), stepIndex: 4 },
  ]

  return (
    <div className="flex flex-col gap-6">
      <ul className="border-input flex flex-col overflow-hidden rounded-lg border">
        {rows.map((row, index) => (
          <li
            key={row.label}
            className={cn(
              'flex items-center justify-between gap-3 px-3 py-2.5 text-sm',
              index < rows.length - 1 && 'border-input border-b',
              index % 2 === 1 && 'bg-muted/40'
            )}
          >
            <span className="text-muted-foreground shrink-0">{row.label}</span>
            <span className="min-w-0 flex-1 truncate text-right font-medium">
              {formatValue(row.value)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${row.label}`}
              onClick={() => onEditStep(row.stepIndex)}
            >
              <Pencil />
            </Button>
          </li>
        ))}
      </ul>

      <FormField
        name="additionalNotes"
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Additional notes (optional)</Label>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="Anything else that helps us tailor your plan…"
              className="min-h-24"
            />
            {fieldState.error?.message && (
              <p className="text-destructive text-sm" role="alert">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}
