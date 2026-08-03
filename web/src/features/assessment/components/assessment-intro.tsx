'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ClipboardCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { WIZARD_STEPS } from '@/features/assessment/lib/wizard'

interface AssessmentIntroProps {
  onStart: () => void
}

export function AssessmentIntro({ onStart }: AssessmentIntroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="flex flex-col gap-6">
          <span className="bg-primary text-primary-foreground flex size-12 shrink-0 items-center justify-center rounded-xl">
            <ClipboardCheck className="size-6" />
          </span>

          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Shape your career plan
            </h1>
            <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
              Answer a few quick questions about your goals and experience.
              Compass AI uses your answers to build a personalized learning
              roadmap, so you always know what to work on next.
            </p>
          </div>

          <ol className="grid gap-2 sm:grid-cols-2">
            {WIZARD_STEPS.map((step) => (
              <li
                key={step.id}
                className="border-input bg-background flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm"
              >
                <step.icon className="text-muted-foreground size-4 shrink-0" />
                <span className="text-muted-foreground tabular-nums">
                  {String(step.index + 1).padStart(2, '0')}
                </span>
                <span className="font-medium">{step.title}</span>
              </li>
            ))}
          </ol>

          <Button size="lg" onClick={onStart} className="self-start">
            Start assessment
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
