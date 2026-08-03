'use client'

import { FormField } from '@/components/ui/form'
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { TechStackInput } from './tech-stack-input'

interface FieldBaseProps {
  name: string
  label: string
  description?: string
  optional?: boolean
}

export function ProjectTitleField({
  name,
  label,
  description,
}: FieldBaseProps) {
  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder="e.g. Portfolio website"
              value={String(field.value ?? '')}
              onChange={field.onChange}
              aria-invalid={!!fieldState.error}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function ProjectDescriptionField({
  name,
  label,
  description,
}: FieldBaseProps) {
  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder="What is this project about?"
              value={String(field.value ?? '')}
              onChange={field.onChange}
              aria-invalid={!!fieldState.error}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface StatusOption {
  value: string
  label: string
}

export function ProjectStatusField({
  name,
  label,
  description,
  options,
  placeholder = 'No change',
}: FieldBaseProps & {
  options: StatusOption[]
  placeholder?: string
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select
              value={field.value === '' || field.value == null ? null : String(field.value)}
              onValueChange={(value) => field.onChange(value ?? '')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function ProjectTechStackField({
  name,
  label,
  description,
}: FieldBaseProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <TechStackInput
              value={(field.value as string[] | undefined) ?? []}
              onChange={(value) => field.onChange(value)}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function ProjectUrlField({
  name,
  label,
  description,
  placeholder,
}: FieldBaseProps & { placeholder?: string }) {
  return (
    <FormField
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="url"
              placeholder={placeholder ?? 'https://…'}
              value={String(field.value ?? '')}
              onChange={field.onChange}
              aria-invalid={!!fieldState.error}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
