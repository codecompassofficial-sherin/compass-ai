import {
  Boxes,
  Briefcase,
  Crown,
  Cpu,
  Gauge,
  GraduationCap,
  Layers,
  Monitor,
  Rocket,
  Server,
  Smartphone,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'

import type { ChoiceOption } from '@/features/assessment/components/choice-grid'

export const TARGET_ROLE_OPTIONS: ChoiceOption[] = [
  {
    value: 'Frontend Developer',
    label: 'Frontend Developer',
    description: 'Build the interfaces users see and interact with.',
    icon: Monitor,
  },
  {
    value: 'Backend Developer',
    label: 'Backend Developer',
    description: 'Build the APIs and services that power products.',
    icon: Server,
  },
  {
    value: 'Full Stack Developer',
    label: 'Full Stack Developer',
    description: 'Work across both frontend and backend.',
    icon: Layers,
  },
  {
    value: 'Mobile Developer',
    label: 'Mobile Developer',
    description: 'Build apps for iOS, Android, and beyond.',
    icon: Smartphone,
  },
  {
    value: 'DevOps Engineer',
    label: 'DevOps Engineer',
    description: 'Automate, deploy, and scale infrastructure.',
    icon: Boxes,
  },
  {
    value: 'AI/ML Engineer',
    label: 'AI/ML Engineer',
    description: 'Build models and intelligent features.',
    icon: Cpu,
  },
]

export const EXPERIENCE_LEVEL_OPTIONS: ChoiceOption[] = [
  {
    value: 'Beginner',
    label: 'Beginner',
    description: 'New to the field and learning the fundamentals.',
    icon: GraduationCap,
  },
  {
    value: 'Intermediate',
    label: 'Intermediate',
    description: 'Comfortable building with some hands-on experience.',
    icon: Rocket,
  },
  {
    value: 'Advanced',
    label: 'Advanced',
    description: 'Deep experience building and shipping complex work.',
    icon: Crown,
  },
]

export const CAREER_GOAL_OPTIONS: ChoiceOption[] = [
  {
    value: 'First Tech Role',
    label: 'First Tech Role',
    description: 'Land your first job in tech.',
    icon: UserPlus,
  },
  {
    value: 'Career Switch',
    label: 'Career Switch',
    description: 'Move into tech from another field.',
    icon: Briefcase,
  },
  {
    value: 'Skill Advancement',
    label: 'Skill Advancement',
    description: 'Deepen your skills in a specific area.',
    icon: TrendingUp,
  },
  {
    value: 'Career Advancement',
    label: 'Career Advancement',
    description: 'Progress to the next level or role.',
    icon: Gauge,
  },
  {
    value: 'Leadership',
    label: 'Leadership',
    description: 'Grow into a leadership position.',
    icon: Users,
  },
]

export const TIMELINE_OPTIONS: ChoiceOption[] = [
  {
    value: '3 Months',
    label: '3 Months',
    description: 'A short, focused sprint.',
  },
  {
    value: '6 Months',
    label: '6 Months',
    description: 'A steady, balanced pace.',
  },
  {
    value: '12 Months',
    label: '12 Months',
    description: 'An in-depth, thorough plan.',
  },
]
