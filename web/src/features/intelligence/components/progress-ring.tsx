import { cn } from '@/lib/utils'

interface ProgressRingProps {
  value: number
  className?: string
}

const SIZE = 112
const STROKE_WIDTH = 10
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function ProgressRing({ value, className }: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)))
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center',
        className
      )}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          className="fill-none stroke-muted"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          className="fill-none stroke-primary transition-[stroke-dashoffset] duration-500 ease-out"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-xl font-semibold tabular-nums">
          {clamped}%
        </span>
      </div>
    </div>
  )
}
