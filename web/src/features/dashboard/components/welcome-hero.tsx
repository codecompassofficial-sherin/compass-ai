'use client'

import { motion } from 'framer-motion'
import { Flag, Rocket, Target } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type {
  DashboardData,
  IntelligenceData,
} from '@/features/dashboard/dashboard.types'

interface WelcomeHeroProps {
  dashboard: DashboardData
  intelligence: IntelligenceData
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) {
    return 'Good morning'
  }
  if (hour < 18) {
    return 'Good afternoon'
  }
  return 'Good evening'
}

function getInitials(firstName: string, lastName: string): string {
  const first = firstName.charAt(0)
  const last = lastName.charAt(0)
  return last ? `${first}${last}`.toUpperCase() : first.toUpperCase()
}

function getMotivationalLine(
  profile: DashboardData['profile'],
  roadmap: DashboardData['roadmap'],
  readinessSummary: string
): string {
  if (!profile.targetRole) {
    return 'Take your career assessment to unlock a personalized plan built around your goals.'
  }
  if (!roadmap) {
    return 'You are one step away from a personalized learning roadmap.'
  }
  return readinessSummary
}

export function WelcomeHero({ dashboard, intelligence }: WelcomeHeroProps) {
  const { user } = useAuth()
  const { profile } = dashboard

  const firstName = user?.firstName ?? 'there'
  const lastName = user?.lastName ?? ''
  const message = getMotivationalLine(
    profile,
    dashboard.roadmap,
    intelligence.roadmap.readinessSummary
  )

  const chips = [
    profile.targetRole ? { label: profile.targetRole, icon: Target } : null,
    profile.primaryCareerGoal
      ? { label: profile.primaryCareerGoal, icon: Flag }
      : null,
    profile.experienceLevel
      ? { label: profile.experienceLevel, icon: Rocket }
      : null,
  ].filter(
    (chip): chip is { label: string; icon: typeof Target } => chip !== null
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:items-center">
            <Avatar className="size-11 sm:size-12">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(firstName, lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-muted-foreground mt-0.5 text-sm">{message}</p>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="flex shrink-0 flex-wrap gap-1.5">
              {chips.map((chip) => (
                <Badge key={chip.label} variant="outline" className="h-6 gap-1">
                  <chip.icon className="size-3 shrink-0" />
                  <span className="truncate">{chip.label}</span>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
