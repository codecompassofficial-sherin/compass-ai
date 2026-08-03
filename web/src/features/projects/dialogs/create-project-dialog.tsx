'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { CreateProjectForm } from '../forms/create-project-form'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({
  open,
  onOpenChange,
}: CreateProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a project</DialogTitle>
          <DialogDescription>
            Capture a project to showcase on your profile.
          </DialogDescription>
        </DialogHeader>

        {open && <CreateProjectForm onSuccess={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}
