'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Map, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingScreen } from '@/components/feedback/loading'
import { useAssessment } from '@/features/assessment/hooks/useAssessment'
import { isAssessmentNotFound } from '@/features/assessment/assessment.api'

import { getRoadmapErrorDetails } from '../api/roadmap.api'
import { useGenerateRoadmap } from '../hooks/useGenerateRoadmap'
import { RoadmapError } from './roadmap-error'

const STEPS = [
  {
    title: 'We analyze your assessment',
    description:
      'Your target role, experience, and skills shape the sequence of learning phases.',
  },
  {
    title: 'We map concrete goals',
    description:
      'Phases from Foundations to Interview Prep, each filled with actionable, skill-based goals.',
  },
  {
    title: 'You take it from there',
    description:
      'Activate a goal to start working in your Goals workspace and track progress.',
  },
]

export function GenerationFlow() {
  const assessment = useAssessment()
  const generate = useGenerateRoadmap()
  const [error, setError] = useState<string | null>(null)

  if (assessment.isPending) {
    return <LoadingScreen label="Checking your assessment…" />
  }

  if (isAssessmentNotFound(assessment.error)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="mx-auto w-full max-w-xl"
      >
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
              <Map className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-lg font-semibold tracking-tight">
                Your assessment comes first
              </h2>
              <p className="text-muted-foreground max-w-sm text-sm">
                Tell us about your target role, experience, and skills so we can
                build a roadmap that fits you.
              </p>
            </div>
            <Button render={<Link href="/assessments" />}>
              Take the assessment
              <ArrowRight data-icon="inline-end" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (assessment.isError) {
    return (
      <RoadmapError
        error={assessment.error}
        onRetry={() => void assessment.refetch()}
      />
    )
  }

  async function handleGenerate() {
    setError(null)
    try {
      await generate.mutateAsync()
      toast.success('Roadmap generated')
    } catch (err) {
      setError(getRoadmapErrorDetails(err))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mx-auto w-full max-w-2xl"
    >
      <Card>
        <CardContent className="flex flex-col gap-8 py-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
              <Map className="size-6" />
            </span>
            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-xl font-semibold tracking-tight">
                Your personalized roadmap is ready
              </h2>
              <p className="text-muted-foreground max-w-md text-sm">
                We turned your assessment into a structured plan of phases and
                goals designed to take you from where you are to your target
                role.
              </p>
            </div>
          </div>

          <ol className="flex flex-col gap-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="bg-muted text-muted-foreground mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {error && (
            <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
              {error}
            </p>
          )}

          <div className="flex flex-col items-center gap-2">
            <Button size="lg" onClick={handleGenerate} disabled={generate.isPending}>
              {generate.isPending ? 'Generating your roadmap…' : 'Generate my roadmap'}
              {!generate.isPending && <Sparkles data-icon="inline-end" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
