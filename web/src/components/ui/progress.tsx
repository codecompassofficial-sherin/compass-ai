'use client'

import { Progress as ProgressPrimitive } from '@base-ui/react/progress'

import { cn } from '@/lib/utils'

function Progress({
  className,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        'group/progress relative h-2 w-full shrink-0 overflow-hidden rounded-full',
        className
      )}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Track
        data-slot="progress-track"
        className="bg-muted h-full w-full overflow-hidden rounded-full"
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="bg-primary h-full rounded-full transition-[width] duration-300 ease-out data-[indeterminate]:w-1/2 data-[indeterminate]:animate-pulse"
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
