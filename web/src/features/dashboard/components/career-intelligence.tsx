'use client'

import Link from 'next/link'
import { BookOpen, FolderGit2, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { IntelligenceData } from '@/features/dashboard/dashboard.types'
import { RecommendationCard } from './recommendation-card'

interface CareerIntelligenceProps {
  intelligence: IntelligenceData
}

export function CareerIntelligence({ intelligence }: CareerIntelligenceProps) {
  const { nextBestAction, skillGap, learning, projects } = intelligence
  const learningPick = learning[0]
  const projectPick = projects[0]

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Career Intelligence</CardTitle>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/intelligence" />}
          >
            View all
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <RecommendationCard
          icon={Sparkles}
          title={nextBestAction.title}
          description={nextBestAction.description}
          meta={<Badge variant="secondary">Next up</Badge>}
        />

        <div className="flex flex-col gap-2">
          <h3 className="text-muted-foreground text-xs font-medium">
            Skills to focus on
          </h3>
          {skillGap.recommendedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {skillGap.recommendedSkills.map((skill) => (
                <Badge key={skill} variant="outline" className="h-6">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              Your roadmap skills are on track.
            </p>
          )}
        </div>

        {learningPick ? (
          <RecommendationCard
            icon={BookOpen}
            title={learningPick.goalTitle}
            description={`${learningPick.skill} — ${learningPick.reason}`}
            meta={
              <Badge
                variant={
                  learningPick.priority === 'high' ? 'default' : 'secondary'
                }
              >
                {learningPick.priority} priority
              </Badge>
            }
          />
        ) : (
          <p className="text-muted-foreground text-xs">
            No learning recommendations yet.
          </p>
        )}

        {projectPick ? (
          <RecommendationCard
            icon={FolderGit2}
            title={projectPick.title}
            description={projectPick.reason}
            meta={
              <span className="text-muted-foreground text-xs">
                {projectPick.estimatedEffortHours} hrs
              </span>
            }
          />
        ) : (
          <p className="text-muted-foreground text-xs">
            Project recommendations unlock once your roadmap is ready.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
