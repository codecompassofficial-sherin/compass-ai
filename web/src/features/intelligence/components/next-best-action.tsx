'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getNextBestActionMeta } from '@/features/dashboard/lib/actions'

import { NEXT_BEST_ACTION_IMPACT } from '../constants/intelligence.constants'
import type { NextBestAction } from '../types/intelligence.types'

interface NextBestActionProps {
  nextBestAction: NextBestAction
}

export function NextBestAction({ nextBestAction }: NextBestActionProps) {
  const meta = getNextBestActionMeta(nextBestAction.action)
  const impact = NEXT_BEST_ACTION_IMPACT[nextBestAction.action]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
    >
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="bg-primary text-primary-foreground flex size-11 shrink-0 items-center justify-center rounded-xl">
              <meta.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  {meta.eyebrow}
                </p>
                <Badge>Top priority</Badge>
              </div>
              <h2 className="font-heading mt-1 text-lg font-semibold tracking-tight sm:text-xl">
                {nextBestAction.title}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {nextBestAction.description}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">{impact}</p>
            </div>
          </div>

          <Button
            size="lg"
            className="shrink-0"
            render={<Link href={meta.href} />}
          >
            {meta.label}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
