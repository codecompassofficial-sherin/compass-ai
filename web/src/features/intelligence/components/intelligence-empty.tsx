'use client'

import Link from 'next/link'
import { ClipboardList, Map, RefreshCw, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/empty-state'

export type IntelligenceEmptyVariant =
  | 'no-assessment'
  | 'no-roadmap'
  | 'empty'

interface IntelligenceEmptyProps {
  variant: IntelligenceEmptyVariant
  onRefresh: () => void
}

interface VariantMeta {
  icon: LucideIcon
  title: string
  description: string
  actionLabel: string
  href?: string
}

const VARIANT_META: Record<IntelligenceEmptyVariant, VariantMeta> = {
  'no-assessment': {
    icon: ClipboardList,
    title: 'Complete your career assessment',
    description:
      'Share your current skills and target role to unlock personalized intelligence.',
    actionLabel: 'Start assessment',
    href: '/assessments',
  },
  'no-roadmap': {
    icon: Map,
    title: 'Generate your learning roadmap',
    description:
      'Create a personalized roadmap from your assessment to unlock skill gap analysis, recommendations, and project ideas.',
    actionLabel: 'Generate roadmap',
    href: '/roadmaps',
  },
  empty: {
    icon: Sparkles,
    title: 'No intelligence available yet',
    description:
      'Your insights will appear here once your roadmap has goals and projects to analyze.',
    actionLabel: 'Refresh',
  },
}

export function IntelligenceEmpty({
  variant,
  onRefresh,
}: IntelligenceEmptyProps) {
  const meta = VARIANT_META[variant]

  return (
    <EmptyState
      icon={meta.icon}
      title={meta.title}
      description={meta.description}
      action={
        <div className="flex flex-wrap items-center justify-center gap-2">
          {meta.href && (
            <Button size="sm" render={<Link href={meta.href} />}>
              {meta.actionLabel}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw />
            Refresh
          </Button>
        </div>
      }
    />
  )
}
