'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/feedback/loading'

import { getProjectErrorDetails } from '../api/projects.api'
import { PROJECT_STATUS_META } from '../constants/projects.constants'
import {
  ProjectDescriptionField,
  ProjectTechStackField,
  ProjectTitleField,
  ProjectUrlField,
} from '../forms/project-form-fields'
import { useUpdateProject } from '../hooks/useProjects'
import type { PublicProject } from '../types/projects.types'
import { getAllowedStatusTransitions } from '../utils/projects.utils'
import { buildUpdatePayload } from '../utils/edit-project-payload'
import {
  editProjectSchema,
  type EditProjectFormInput,
  type EditProjectFormOutput,
} from '../validation/projects.validation'

interface EditProjectDialogProps {
  project: PublicProject | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: EditProjectDialogProps) {
  const update = useUpdateProject()
  const [nextStatus, setNextStatus] = useState('')
  const [showDiscard, setShowDiscard] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<EditProjectFormInput, unknown, EditProjectFormOutput>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      title: '',
      description: '',
      technologyStack: [],
      githubUrl: '',
      liveUrl: '',
    },
  })

  useEffect(() => {
    if (!project) {
      return
    }
    form.reset({
      title: project.title,
      description: project.description ?? '',
      technologyStack: project.technologyStack,
      githubUrl: project.githubUrl ?? '',
      liveUrl: project.liveUrl ?? '',
    })
    setNextStatus('')
    setShowDiscard(false)
    setError(null)
  }, [project, form])

  const hasChanges = form.formState.isDirty || nextStatus !== ''

  useEffect(() => {
    if (!open) {
      return
    }
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (form.formState.isDirty || nextStatus !== '') {
        event.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [open, form.formState.isDirty, nextStatus])

  if (!project) {
    return null
  }

  const currentProject = project
  const statusOptions = getAllowedStatusTransitions(currentProject.status)
    .filter((status) => status !== 'archived')
    .map((status) => ({
      value: status,
      label: PROJECT_STATUS_META[status].label,
    }))

  function handleOpenChange(next: boolean) {
    if (!next && hasChanges) {
      setShowDiscard(true)
      return
    }
    setShowDiscard(false)
    setError(null)
    onOpenChange(next)
  }

  function handleDiscard() {
    form.reset()
    setNextStatus('')
    setShowDiscard(false)
    setError(null)
    onOpenChange(false)
  }

  async function handleSubmit(values: EditProjectFormOutput) {
    setError(null)
    const input = buildUpdatePayload(values, currentProject, nextStatus)
    if (Object.keys(input).length === 0) {
      onOpenChange(false)
      return
    }
    try {
      await update.mutateAsync({ id: currentProject.id, input })
      toast.success('Project updated')
      onOpenChange(false)
    } catch (err) {
      setError(getProjectErrorDetails(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>
            Update the details for &quot;{project.title}&quot;.
          </DialogDescription>
        </DialogHeader>

        {showDiscard ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Discard unsaved changes?</p>
              <p className="text-muted-foreground text-sm">
                Your edits have not been saved yet.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDiscard(false)}
              >
                Keep editing
              </Button>
              <Button variant="destructive" onClick={handleDiscard}>
                Discard changes
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
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

                {statusOptions.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <Label>Status</Label>
                    <Select
                      value={nextStatus || null}
                      onValueChange={(value) => setNextStatus(value ?? '')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="No change" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-xs">
                      Move this project to its next stage.
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground rounded-lg bg-muted/50 px-3 py-2 text-sm">
                    This project is completed. Archive it from the project
                    details if you no longer need it.
                  </p>
                )}

                {error && (
                  <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
                    {error}
                  </p>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={update.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={update.isPending || !hasChanges}
                  >
                    {update.isPending ? (
                      <>
                        <Spinner />
                        Saving…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 />
                        Save changes
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
