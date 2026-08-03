'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Spinner } from '@/components/feedback/loading'
import { cn } from '@/lib/utils'

import { getProjectErrorDetails } from '../api/projects.api'
import { PROJECT_STATUS_META } from '../constants/projects.constants'
import { useCreateProject } from '../hooks/useProjects'
import { PROJECT_STATUSES } from '../types/projects.types'
import {
  createProjectSchema,
  type CreateProjectFormInput,
  type CreateProjectFormOutput,
} from '../validation/projects.validation'
import {
  ProjectDescriptionField,
  ProjectStatusField,
  ProjectTechStackField,
  ProjectTitleField,
  ProjectUrlField,
} from './project-form-fields'

const STEPS = [
  { title: 'Overview' },
  { title: 'Links & stack' },
]

const STEP_FIELDS: (keyof CreateProjectFormInput)[][] = [
  ['title', 'description', 'status'],
  ['technologyStack', 'githubUrl', 'liveUrl'],
]

interface CreateProjectFormProps {
  onSuccess: () => void
}

export function CreateProjectForm({ onSuccess }: CreateProjectFormProps) {
  const create = useCreateProject()
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateProjectFormInput, unknown, CreateProjectFormOutput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      description: '',
      technologyStack: [],
      githubUrl: '',
      liveUrl: '',
      status: 'planned',
    },
  })

  const statusOptions = PROJECT_STATUSES.filter(
    (status) => status !== 'archived'
  ).map((status) => ({
    value: status,
    label: PROJECT_STATUS_META[status].label,
  }))

  async function handleNext() {
    setError(null)
    const valid = await form.trigger(STEP_FIELDS[step])
    if (valid) {
      setStep(1)
    }
  }

  async function handleSubmit(values: CreateProjectFormOutput) {
    setError(null)
    try {
      await create.mutateAsync(values)
      toast.success('Project created')
      onSuccess()
    } catch (err) {
      setError(getProjectErrorDetails(err))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex flex-col gap-4">
          <Stepper current={step} />

          {step === 0 && (
            <div className="flex flex-col gap-4">
              <ProjectTitleField
                name="title"
                label="Project title"
                description="A short, recognizable name for your project."
              />
              <ProjectDescriptionField
                name="description"
                label="Description"
                description="What does this project do?"
              />
              <ProjectStatusField
                name="status"
                label="Status"
                description="Where is this project right now?"
                options={statusOptions}
                placeholder="Planned"
              />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <ProjectTechStackField
                name="technologyStack"
                label="Technology stack"
                description="Add the technologies this project uses."
              />
              <ProjectUrlField
                name="githubUrl"
                label="GitHub URL"
                placeholder="https://github.com/…"
              />
              <ProjectUrlField
                name="liveUrl"
                label="Live demo URL"
                placeholder="https://…"
              />
            </div>
          )}

          {error && (
            <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0 || create.isPending}
              onClick={() => setStep(0)}
            >
              <ArrowLeft />
              Back
            </Button>

            {step === 0 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight data-icon="inline-end" />
              </Button>
            ) : (
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? (
                  <>
                    <Spinner />
                    Creating…
                  </>
                ) : (
                  <>
                    Create project
                    <CheckCircle2 data-icon="inline-end" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  )
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-3">
      {STEPS.map((step, index) => {
        const active = index === current
        const complete = index < current
        return (
          <div key={step.title} className="flex flex-1 flex-col gap-1.5">
            <div
              className={cn(
                'h-1 rounded-full transition-colors',
                complete || active ? 'bg-primary' : 'bg-muted'
              )}
            />
            <span
              className={cn(
                'text-xs font-medium',
                active ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {step.title}
            </span>
          </div>
        )
      })}
    </div>
  )
}
