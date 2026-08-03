'use client'

import { motion } from 'framer-motion'

import { Progress } from '@/components/ui/progress'
import type { WizardStep } from '@/features/assessment/lib/wizard'
import { TOTAL_STEPS } from '@/features/assessment/lib/wizard'

interface WizardProgressProps {
  step: WizardStep
}

export function WizardProgress({ step }: WizardProgressProps) {
  const Icon = step.icon
  const stepNumber = Math.min(step.index + 1, TOTAL_STEPS)
  const percent = Math.round((stepNumber / TOTAL_STEPS) * 100)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <motion.span
          key={step.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg"
        >
          <Icon className="size-5" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Step {stepNumber} of {TOTAL_STEPS}
          </p>
          <h2 className="font-heading text-base font-semibold tracking-tight sm:text-lg">
            {step.title}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {step.description}
          </p>
        </div>
        <span className="font-heading text-muted-foreground shrink-0 text-lg font-semibold tabular-nums">
          {percent}%
        </span>
      </div>
      <Progress value={percent} aria-label="Assessment progress" />
    </div>
  )
}
