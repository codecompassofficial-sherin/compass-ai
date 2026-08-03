import Link from 'next/link'
import { Compass } from 'lucide-react'

import { EmptyState } from '@/components/feedback/empty-state'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you are looking for doesn't exist or has been moved."
        action={
          <Button size="sm" render={<Link href="/welcome" />}>
            Back to home
          </Button>
        }
      />
    </div>
  )
}
