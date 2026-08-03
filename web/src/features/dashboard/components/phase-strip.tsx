import { cn } from '@/lib/utils'

interface PhaseStripProps {
  totalPhases: number
  completedPhases: number
  currentPhaseName?: string | null
}

export function PhaseStrip({
  totalPhases,
  completedPhases,
  currentPhaseName,
}: PhaseStripProps) {
  if (totalPhases <= 0) {
    return null
  }

  const allComplete = completedPhases >= totalPhases

  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPhases }).map((_, index) => {
          const isDone = index < completedPhases
          const isCurrent = index === completedPhases && !allComplete
          return (
            <span
              key={index}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors duration-300',
                isDone && 'bg-primary',
                isCurrent && 'bg-primary ring-primary/25 ring-2',
                !isDone && !isCurrent && 'bg-muted'
              )}
            />
          )
        })}
      </div>
      <p className="text-muted-foreground text-xs">
        {allComplete
          ? 'All phases complete'
          : currentPhaseName
            ? `Current phase: ${currentPhaseName}`
            : `${completedPhases} of ${totalPhases} phases complete`}
      </p>
    </div>
  )
}
