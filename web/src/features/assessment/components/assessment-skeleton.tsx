import { Skeleton } from '@/components/ui/skeleton'

export function AssessmentSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl animate-pulse flex-col gap-6">
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-14 rounded-xl" />
    </div>
  )
}
