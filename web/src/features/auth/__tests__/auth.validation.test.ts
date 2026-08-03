import { describe, expect, it } from 'vitest'

import {
  getPasswordStrength,
  loginSchema,
  registerSchema,
} from '@/features/auth/auth.validation'

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({
      email: '  Ada@Example.COM ',
      password: 'secret123',
      remember: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('ada@example.com')
    }
  })

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret123',
      remember: false,
    })
    expect(result.success).toBe(false)
  })

  it('rejects a missing password', () => {
    const result = loginSchema.safeParse({
      email: 'ada@example.com',
      password: '',
      remember: false,
    })
    expect(result.success).toBe(false)
  })
})

describe('registerSchema', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a short password', () => {
    const result = registerSchema.safeParse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      password: 'secret123',
      confirmPassword: 'secret456',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmIssue = result.error.issues.find(
        (issue) => issue.path[0] === 'confirmPassword'
      )
      expect(confirmIssue?.message).toBe('Passwords do not match')
    }
  })

  it('rejects missing names', () => {
    const result = registerSchema.safeParse({
      firstName: '',
      lastName: '',
      email: 'ada@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
    })
    expect(result.success).toBe(false)
  })
})

describe('getPasswordStrength', () => {
  it('returns 0 for an empty password', () => {
    expect(getPasswordStrength('')).toBe(0)
  })

  it('scores a weak password low', () => {
    expect(getPasswordStrength('abcdefgh')).toBeLessThan(2)
  })

  it('scores a strong password at the maximum', () => {
    expect(getPasswordStrength('Str0ng!Passw0rd')).toBe(4)
  })
})
