import { TriangleAlert } from 'lucide-react'

export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-sm"
    >
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
