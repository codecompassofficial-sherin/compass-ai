import { AppShell } from '@/components/layout/app-shell'
import { RequireAuth } from '@/features/auth/auth.guard'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  )
}
