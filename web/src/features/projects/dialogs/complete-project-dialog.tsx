'use client'

import { useState } from 'react'
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
import { Spinner } from '@/components/feedback/loading'

import { getProjectErrorDetails } from '../api/projects.api'
import { useCompleteProject } from '../hooks/useProjects'
import type { PublicProject } from '../types/projects.types'

interface CompleteProjectDialogProps {
  project: PublicProject | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompleteProjectDialog({
  project,
  open,
  onOpenChange,
}: CompleteProjectDialogProps) {
  const complete = useCompleteProject()
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setError(null)
    }
    onOpenChange(next)
  }

  async function handleConfirm() {
    if (!project) {
      return
    }
    setError(null)
    try {
      await complete.mutateAsync(project.id)
      toast.success('Project completed')
      onOpenChange(false)
    } catch (err) {
      setError(getProjectErrorDetails(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete project?</DialogTitle>
          <DialogDescription>
            Mark &quot;{project?.title}&quot; as completed. Your dashboard and
            workspace stats will update automatically.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={complete.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={complete.isPending || !project}
          >
            {complete.isPending ? (
              <>
                <Spinner />
                Completing…
              </>
            ) : (
              <>
                Complete project
                <CheckCircle2 data-icon="inline-end" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
