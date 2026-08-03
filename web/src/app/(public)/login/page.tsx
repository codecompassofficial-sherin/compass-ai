import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthCard } from '@/features/auth/components/auth-card'
import { LoginForm } from '@/features/auth/components/login-form'
import { GuestOnly } from '@/features/auth/auth.guard'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default function LoginPage() {
  return (
    <GuestOnly>
      <div className="flex min-h-[60vh] items-center justify-center py-8">
        <AuthCard
          title="Welcome back"
          description="Sign in to your account to continue."
          footer={
            <>
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-foreground font-medium underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </>
          }
        >
          <LoginForm />
        </AuthCard>
      </div>
    </GuestOnly>
  )
}
