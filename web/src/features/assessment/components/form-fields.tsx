'use client'

import { FormField } from '@/components/ui/form'
import type { AssessmentFieldName } from '@/features/assessment/assessment.validation'
import { ChoiceGrid, type ChoiceOption } from './choice-grid'
import { SkillPicker } from './skill-picker'

interface FieldHeaderProps {
  label: string
  description?: string
  optional?: boolean
  selectedCount?: number
}

function FieldHeader({
  label,
  description,
  optional,
  selectedCount,
}: FieldHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <span className="text-sm font-medium">
          {label}
          {optional && (
            <span className="text-muted-foreground ml-1.5 text-xs font-normal">
              Optional
            </span>
          )}
        </span>
        {description && (
          <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
        )}
      </div>
      {typeof selectedCount === 'number' && (
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
          {selectedCount} selected
        </span>
      )}
    </div>
  )
}

interface SelectFieldProps {
  name: AssessmentFieldName
  label: string
  description?: string
  options: ChoiceOption[]
  columns?: 1 | 2 | 3
}

export function SelectField({
  name,
  label,
  description,
  options,
  columns = 2,
}: SelectFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-2.5">
          <FieldHeader label={label} description={description} />
          <ChoiceGrid
            options={options}
            value={(field.value as string | undefined) ?? null}
            onChange={(value) => field.onChange(value)}
            columns={columns}
          />
          {fieldState.error?.message && (
            <p className="text-destructive text-sm" role="alert">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  )
}

interface ChipFieldProps {
  name: AssessmentFieldName
  label: string
  description?: string
  options: readonly string[]
  optional?: boolean
}

export function ChipField({
  name,
  label,
  description,
  options,
  optional = false,
}: ChipFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-2.5">
          <FieldHeader
            label={label}
            description={description}
            optional={optional}
            selectedCount={field.value?.length ?? 0}
          />
          <SkillPicker
            options={options}
            value={field.value ?? []}
            onChange={(value) => field.onChange(value)}
          />
          {fieldState.error?.message && (
            <p className="text-destructive text-sm" role="alert">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  )
}
