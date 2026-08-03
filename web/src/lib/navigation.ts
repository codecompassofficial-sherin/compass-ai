import {
  LayoutDashboard,
  ClipboardList,
  Map,
  Target,
  FolderGit2,
  Sparkles,
} from 'lucide-react'
import type { NavSection } from '@/lib/types'

export const appNavigation: NavSection[] = [
  {
    title: 'Overview',
    items: [{ title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Plan',
    items: [
      {
        title: 'Assessments',
        href: '/assessments',
        icon: ClipboardList,
      },
      { title: 'Roadmaps', href: '/roadmaps', icon: Map },
      { title: 'Goals', href: '/goals', icon: Target },
      { title: 'Projects', href: '/projects', icon: FolderGit2 },
    ],
  },
  {
    title: 'Insights',
    items: [
      {
        title: 'Career Intelligence',
        href: '/intelligence',
        icon: Sparkles,
        disabled: true,
      },
    ],
  },
]

export const navItemLabel = (segment: string): string | undefined => {
  const normalized = `/${segment}`
  for (const section of appNavigation) {
    for (const item of section.items) {
      if (item.href === normalized) return item.title
    }
  }
  return undefined
}
