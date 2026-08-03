'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { FormAlert } from '@/features/auth/components/form-alert'
import { Spinner } from '@/components/feedback/loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { getAssessmentErrorDetails } from '@/features/assessment/assessment.api'
import type { PublicAssessment } from '@/features/assessment/assessment.types'
import {
  assessmentFormSchema,
  type AssessmentFormValues,
} from '@/features/assessment/assessment.validation'
import {
  useCreateAssessment,
  useUpdateAssessment,
} from '@/features/assessment/hooks/useAssessment'
import { TOTAL_STEPS, WIZARD_STEPS } from '@/features/assessment/lib/wizard'
import { WizardProgress } from './wizard-progress'
import { CareerGoalStep } from './steps/career-goal-step'
import { ExperienceStep } from './steps/experience-step'
import { ReviewStep } from './steps/review-step'
import { SkillsStep } from './steps/skills-step'
import { TargetRoleStep } from './steps/target-role-step'
import { TechnologyStep } from './steps/technology-step'

interface AssessmentWizardProps {
  assessment?: PublicAssessment
}

function toFormValues(
  assessment?: PublicAssessment
): Partial<AssessmentFormValues> {
  if (!assessment) {
    return {}
  }
  return {
    targetRole: assessment.targetRole,
    experienceLevel: assessment.experienceLevel,
    technologyPreferences: assessment.technologyPreferences,
    currentSkills: assessment.currentSkills,
    primaryCareerGoal: assessment.primaryCareerGoal,
    additionalNotes: assessment.additionalNotes ?? '',
    targetTimeline: assessment.targetTimeline,
  }
}

function toAssessmentInput(values: AssessmentFormValues): AssessmentFormValues {
  const notes = values.additionalNotes?.trim()
  return notes
    ? { ...values, additionalNotes: notes }
    : { ...values, additionalNotes: undefined }
}

export function AssessmentWizard({ assessment }: AssessmentWizardProps) {
  const router = useRouter()
  const [stepIndex, setStepIndex] = useState(0)
  const [formError, setFormError] = useState<string | null>(null)

  const createMutation = useCreateAssessment()
  const updateMutation = useUpdateAssessment()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: toFormValues(assessment),
  })

  const step = WIZARD_STEPS[stepIndex]
  const isLastStep = stepIndex === TOTAL_STEPS - 1

  async function handleNext() {
    setFormError(null)
    const valid = await form.trigger(step.fields)
    if (valid) {
      setStepIndex((current) => Math.min(current + 1, TOTAL_STEPS - 1))
    }
  }

  function handleBack() {
    setFormError(null)
    setStepIndex((current) => Math.max(current - 1, 0))
  }

  function handleEditStep(index: number) {
    setFormError(null)
    setStepIndex(index)
  }

  async function onSubmit(values: AssessmentFormValues) {
    setFormError(null)
    try {
      if (assessment) {
        await updateMutation.mutateAsync(toAssessmentInput(values))
        toast.success('Assessment updated')
      } else {
        await createMutation.mutateAsync(toAssessmentInput(values))
        toast.success('Assessment saved')
      }
      router.push('/roadmaps')
      router.refresh()
    } catch (error) {
      setFormError(getAssessmentErrorDetails(error))
    }
  }

  function renderStep(id: string) {
    switch (id) {
      case 'target-role':
        return <TargetRoleStep />
      case 'experience-level':
        return <ExperienceStep />
      case 'technology':
        return <TechnologyStep />
      case 'current-skills':
        return <SkillsStep />
      case 'career-goal':
        return <CareerGoalStep />
      case 'review':
        return <ReviewStep onEditStep={handleEditStep} />
      default:
        return null
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="mx-auto flex w-full max-w-3xl flex-col gap-6"
      >
        <Card>
          <CardContent className="flex flex-col gap-6">
            <WizardProgress step={step} />

            <div className="min-h-80">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {renderStep(step.id)}
                </motion.div>
              </AnimatePresence>
            </div>
          </CardContent>

          {formError && (
            <div className="px-(--card-spacing)">
              <FormAlert message={formError} />
            </div>
          )}

          <CardFooter className="justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={stepIndex === 0 || isSubmitting}
            >
              <ArrowLeft />
              Back
            </Button>

            {isLastStep ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner />
                    Saving…
                  </>
                ) : (
                  <>
                    {assessment ? 'Save changes' : 'Save assessment'}
                    <Check data-icon="inline-end" />
                  </>
                )}
              </Button>
            ) : (
              <Button type="button" onClick={handleNext}>
                Continue
                <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
