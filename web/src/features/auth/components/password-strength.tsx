import { cn } from '@/lib/utils'
import { getPasswordStrength } from '@/features/auth/auth.validation'

const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']

export function PasswordStrength({ password }: { password: string }) {
  const score = getPasswordStrength(password)

  if (password.length === 0) {
    return null
  }

  const barClass =
    score <= 1 ? 'bg-destructive' : score === 2 ? 'bg-amber-500' : 'bg-primary'

  return (
    <div className="flex items-center gap-2" aria-live="polite">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              index < score ? barClass : 'bg-muted'
            )}
          />
        ))}
      </div>
      <span className="text-muted-foreground w-16 text-right text-xs">
        {STRENGTH_LABELS[score]}
      </span>
    </div>
  )
}
