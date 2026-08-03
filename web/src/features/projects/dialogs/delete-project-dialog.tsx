'use client'

import { useState } from 'react'
import { Archive } from 'lucide-react'
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
import { useArchiveProject } from '../hooks/useProjects'
import type { PublicProject } from '../types/projects.types'

interface DeleteProjectDialogProps {
  project: PublicProject | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteProjectDialog({
  project,
  open,
  onOpenChange,
}: DeleteProjectDialogProps) {
  const archive = useArchiveProject()
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
      await archive.mutateAsync(project.id)
      toast.success('Project archived')
      onOpenChange(false)
    } catch (err) {
      setError(getProjectErrorDetails(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive project?</DialogTitle>
          <DialogDescription>
            Archive &quot;{project?.title}&quot;? It will be removed from your
            active project list. This can be done for projects in any stage.
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
            disabled={archive.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={archive.isPending || !project}
          >
            {archive.isPending ? (
              <>
                <Spinner />
                Archiving…
              </>
            ) : (
              <>
                <Archive />
                Archive project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
