import {
  ClipboardList,
  FolderGit2,
  Map,
  Play,
  RefreshCw,
  Target,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { NextBestActionCode } from '@/features/dashboard/dashboard.types'

export interface NextBestActionMeta {
  eyebrow: string
  label: string
  href: string
  icon: LucideIcon
}

const NEXT_BEST_ACTION_META: Record<NextBestActionCode, NextBestActionMeta> = {
  COMPLETE_ASSESSMENT: {
    eyebrow: 'Get started',
    label: 'Start assessment',
    href: '/assessments',
    icon: ClipboardList,
  },
  GENERATE_ROADMAP: {
    eyebrow: 'Build your plan',
    label: 'Generate roadmap',
    href: '/roadmaps',
    icon: Map,
  },
  ACTIVATE_GOAL: {
    eyebrow: 'Make progress',
    label: 'Start goal',
    href: '/goals',
    icon: Target,
  },
  CONTINUE_GOAL: {
    eyebrow: 'Keep going',
    label: 'Continue goal',
    href: '/goals',
    icon: Play,
  },
  START_PROJECT: {
    eyebrow: 'Apply your skills',
    label: 'Start project',
    href: '/projects',
    icon: FolderGit2,
  },
  REGENERATE_ROADMAP: {
    eyebrow: 'Keep advancing',
    label: 'Regenerate roadmap',
    href: '/roadmaps',
    icon: RefreshCw,
  },
}

export function getNextBestActionMeta(
  action: NextBestActionCode
): NextBestActionMeta {
  return (
    NEXT_BEST_ACTION_META[action] ?? NEXT_BEST_ACTION_META.COMPLETE_ASSESSMENT
  )
}
