import Link from 'next/link'
import { ArrowRight, ClipboardList, Map, Sparkles, Target } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    title: 'Assessments',
    description:
      'Evaluate skills and career readiness with guided assessments.',
    icon: ClipboardList,
  },
  {
    title: 'Roadmaps',
    description: 'Follow step-by-step paths toward your target role.',
    icon: Map,
  },
  {
    title: 'Goals & Projects',
    description: 'Track goals and projects that move your career forward.',
    icon: Target,
  },
  {
    title: 'Career Intelligence',
    description: 'Get AI-powered insights about your career trajectory.',
    icon: Sparkles,
  },
]

export default function WelcomePage() {
  return (
    <div className="flex flex-col gap-14 py-12 sm:py-20">
      <section className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Badge variant="secondary" className="mb-5">
          Public preview
        </Badge>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Your career, navigated.
        </h1>
        <p className="text-muted-foreground mt-4 max-w-xl text-base text-pretty sm:text-lg">
          Compass AI helps you plan, track, and grow your career with
          assessments, roadmaps, and AI-powered guidance.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/dashboard" />}>
            Open the app
            <ArrowRight data-icon="inline-end" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            render={<Link href="/dashboard" />}
          >
            View sample dashboard
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="gap-3">
            <CardContent className="flex flex-col gap-3 p-5">
              <span className="bg-muted/50 text-muted-foreground flex size-9 items-center justify-center rounded-lg border">
                <Icon className="size-4" />
              </span>
              <div>
                <h2 className="font-heading flex items-center gap-2 text-sm font-medium tracking-tight">
                  {title}
                  <Badge variant="outline" className="text-[10px]">
                    Soon
                  </Badge>
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
