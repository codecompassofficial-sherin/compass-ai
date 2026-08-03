'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
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

import { getRoadmapErrorDetails } from '../api/roadmap.api'
import { useRegenerateRoadmap } from '../hooks/useGenerateRoadmap'

interface RegenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentVersion: number
}

export function RegenerateDialog({
  open,
  onOpenChange,
  currentVersion,
}: RegenerateDialogProps) {
  const regenerate = useRegenerateRoadmap()
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setError(null)
    }
    onOpenChange(next)
  }

  async function handleConfirm() {
    setError(null)
    try {
      await regenerate.mutateAsync()
      toast.success('Roadmap regenerated')
      onOpenChange(false)
    } catch (err) {
      setError(getRoadmapErrorDetails(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regenerate roadmap?</DialogTitle>
          <DialogDescription>
            Your current roadmap (v{currentVersion}) will be archived and a new
            version will be generated from your latest assessment.
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
            disabled={regenerate.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={regenerate.isPending}>
            {regenerate.isPending ? (
              <>
                <Spinner />
                Regenerating…
              </>
            ) : (
              <>
                Regenerate
                <RefreshCw data-icon="inline-end" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
