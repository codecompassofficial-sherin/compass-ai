import type { VariantProps } from 'class-variance-authority'
import { CheckCircle2, CircleAlert, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Badge, badgeVariants } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/feedback/empty-state'

import type { SkillGapAnalysis } from '../types/intelligence.types'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

type SkillGroupKey =
  | 'acquiredSkills'
  | 'missingSkills'
  | 'recommendedSkills'

interface SkillGroup {
  key: SkillGroupKey
  label: string
  description: string
  icon: LucideIcon
  badgeVariant: BadgeVariant
}

const SKILL_GROUPS: SkillGroup[] = [
  {
    key: 'acquiredSkills',
    label: 'Acquired',
    description: 'Skills you already have',
    icon: CheckCircle2,
    badgeVariant: 'outline',
  },
  {
    key: 'missingSkills',
    label: 'Missing',
    description: 'Needed for your roadmap goals',
    icon: CircleAlert,
    badgeVariant: 'destructive',
  },
  {
    key: 'recommendedSkills',
    label: 'Recommended focus',
    description: 'Prioritize these next',
    icon: Target,
    badgeVariant: 'default',
  },
]

interface SkillGapProps {
  skillGap: SkillGapAnalysis
}

export function SkillGap({ skillGap }: SkillGapProps) {
  const hasSkills = SKILL_GROUPS.some((group) => skillGap[group.key].length > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="text-muted-foreground size-4" />
          Skill gap analysis
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Where you stand versus what your roadmap needs.
        </p>
      </CardHeader>
      <CardContent>
        {hasSkills ? (
          <div className="grid gap-6 sm:grid-cols-3">
            {SKILL_GROUPS.map((group) => {
              const skills = skillGap[group.key]
              return (
                <div key={group.key} className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <group.icon className="text-muted-foreground size-3.5" />
                    <span className="text-xs font-medium">{group.label}</span>
                    <Badge variant="ghost" className="ml-auto h-5">
                      {skills.length}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {group.description}
                  </p>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill) => (
                        <Badge key={skill} variant={group.badgeVariant}>
                          <span className="truncate">{skill}</span>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-xs">None yet</p>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="No skill data yet"
            description="Complete your assessment and generate a roadmap to see your skill gaps."
            className="px-4 py-8"
          />
        )}
      </CardContent>
    </Card>
  )
}
