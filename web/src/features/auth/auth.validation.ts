import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Enter your email address')
    .email('Enter a valid email address')
    .max(254),
  password: z.string().min(1, 'Enter your password').max(72),
  remember: z.boolean(),
})

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Enter your first name').max(100),
    lastName: z.string().trim().min(1, 'Enter your last name').max(100),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, 'Enter your email address')
      .email('Enter a valid email address')
      .max(254),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>

export function getPasswordStrength(password: string): number {
  if (!password) {
    return 0
  }

  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return Math.min(score, 4)
}
