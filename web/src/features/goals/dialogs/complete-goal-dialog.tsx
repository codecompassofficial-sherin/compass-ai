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

import { getGoalErrorDetails } from '../api/goals.api'
import { useCompleteGoal } from '../hooks/useGoals'
import type { PublicGoal } from '../types/goals.types'

interface CompleteGoalDialogProps {
  goal: PublicGoal | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CompleteGoalDialog({
  goal,
  open,
  onOpenChange,
}: CompleteGoalDialogProps) {
  const complete = useCompleteGoal()
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(next: boolean) {
    if (!next) {
      setError(null)
    }
    onOpenChange(next)
  }

  async function handleConfirm() {
    if (!goal) {
      return
    }
    setError(null)
    try {
      await complete.mutateAsync(goal.id)
      toast.success('Goal completed')
      onOpenChange(false)
    } catch (err) {
      setError(getGoalErrorDetails(err))
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete goal?</DialogTitle>
          <DialogDescription>
            Mark &quot;{goal?.title}&quot; as complete. Your dashboard and
            roadmap progress will update automatically.
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
            disabled={complete.isPending || !goal}
          >
            {complete.isPending ? (
              <>
                <Spinner />
                Completing…
              </>
            ) : (
              <>
                Complete goal
                <CheckCircle2 data-icon="inline-end" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
