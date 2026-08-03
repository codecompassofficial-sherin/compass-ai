'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/features/auth/auth.store'

function AuthSkeleton() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-8">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="bg-card flex flex-col gap-3 rounded-2xl border p-6 sm:p-8">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  )
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const status = useAuthStore((state) => state.status)

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status, router])

  if (status === 'authenticated' || status === 'loading') {
    return <AuthSkeleton />
  }

  return <>{children}</>
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const status = useAuthStore((state) => state.status)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  if (status === 'loading' || status === 'unauthenticated') {
    return <AuthSkeleton />
  }

  return <>{children}</>
}
