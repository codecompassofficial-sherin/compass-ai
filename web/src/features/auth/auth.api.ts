import { ApiError, apiRequest, isRecord } from '@/lib/api'

import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  User,
} from './auth.types'

export const authApi = {
  login: (input: LoginInput) =>
    apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: input }),
  register: (input: RegisterInput) =>
    apiRequest<AuthResponse>('/auth/register', { method: 'POST', body: input }),
  logout: () => apiRequest<null>('/auth/logout', { method: 'POST' }),
  refresh: () =>
    apiRequest<{ accessToken: string }>('/auth/refresh', { method: 'POST' }),
  getMe: () => apiRequest<{ user: User }>('/auth/me'),
}

export interface AuthErrorDetails {
  message: string
  fieldErrors: Record<string, string>
}

function extractFieldErrors(body: unknown): Record<string, string> {
  if (!isRecord(body) || !isRecord(body.error)) {
    return {}
  }

  const details = body.error.details
  if (!Array.isArray(details)) {
    return {}
  }

  const fieldErrors: Record<string, string> = {}
  for (const item of details) {
    if (
      isRecord(item) &&
      typeof item.path === 'string' &&
      typeof item.message === 'string'
    ) {
      fieldErrors[item.path] = item.message
    }
  }
  return fieldErrors
}

export function getAuthErrorDetails(error: unknown): AuthErrorDetails {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return {
        message:
          'Unable to reach the server. Check your connection and try again.',
        fieldErrors: {},
      }
    }

    switch (error.code) {
      case 'INVALID_CREDENTIALS':
        return { message: 'Invalid email or password.', fieldErrors: {} }
      case 'EMAIL_ALREADY_EXISTS':
        return {
          message: 'An account with this email already exists.',
          fieldErrors: { email: 'An account with this email already exists.' },
        }
      case 'VALIDATION_ERROR':
        return {
          message: 'Please check the highlighted fields and try again.',
          fieldErrors: extractFieldErrors(error.body),
        }
      case 'INTERNAL_SERVER_ERROR':
        return {
          message: 'Something went wrong on our end. Please try again.',
          fieldErrors: {},
        }
    }

    if (error.status === 401) {
      return {
        message: 'Your session has expired. Please sign in again.',
        fieldErrors: {},
      }
    }
  }

  return { message: 'Something went wrong. Please try again.', fieldErrors: {} }
}
