import { Skeleton } from '@/components/ui/skeleton'

export function GoalsSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-[28rem] rounded-xl lg:col-span-2" />
      </div>
    </div>
  )
}
