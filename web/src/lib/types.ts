import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  disabled?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export interface User {
  name: string | null
  email: string | null
  initials: string
}
