import { Skeleton } from '@/components/ui/skeleton'

export function ProjectsSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <Skeleton className="h-52 rounded-xl" />
      <Skeleton className="h-10 rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  )
}
