import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-4 animate-spin', className)} />
}

interface LoadingScreenProps {
  label?: string
  className?: string
}

export function LoadingScreen({ label, className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex min-h-[50vh] flex-1 flex-col items-center justify-center gap-3',
        className
      )}
    >
      <Spinner className="text-muted-foreground size-5" />
      {label && <p className="text-muted-foreground text-sm">{label}</p>}
    </div>
  )
}
