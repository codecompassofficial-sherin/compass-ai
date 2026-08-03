'use client'

import { useEffect } from 'react'

import { TooltipProvider } from '@/components/ui/tooltip'
import { restoreSession } from '@/features/auth/hooks/useAuth'
import { QueryProvider } from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'

export function GlobalProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void restoreSession()
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <TooltipProvider delay={300}>{children}</TooltipProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
