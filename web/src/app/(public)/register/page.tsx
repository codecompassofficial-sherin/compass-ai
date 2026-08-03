import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthCard } from '@/features/auth/components/auth-card'
import { RegisterForm } from '@/features/auth/components/register-form'
import { GuestOnly } from '@/features/auth/auth.guard'

export const metadata: Metadata = {
  title: 'Create account',
}

export default function RegisterPage() {
  return (
    <GuestOnly>
      <div className="flex min-h-[60vh] items-center justify-center py-8">
        <AuthCard
          title="Create your account"
          description="Start planning your career in minutes."
          footer={
            <>
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-foreground font-medium underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </>
          }
        >
          <RegisterForm />
        </AuthCard>
      </div>
    </GuestOnly>
  )
}
