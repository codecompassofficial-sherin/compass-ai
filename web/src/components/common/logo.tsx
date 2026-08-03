import { Compass } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LogoProps {
  collapsed?: boolean
  className?: string
}

export function Logo({ collapsed = false, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="bg-foreground text-background flex size-7 shrink-0 items-center justify-center rounded-lg">
        <Compass className="size-4" />
      </span>
      {!collapsed && (
        <span className="font-heading text-base font-semibold tracking-tight">
          Compass AI
        </span>
      )}
    </div>
  )
}
