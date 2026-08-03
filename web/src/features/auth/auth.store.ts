'use client'

import { create } from 'zustand'

import { setAccessToken } from '@/lib/api'

import type { User } from './auth.types'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthState {
  status: AuthStatus
  user: User | null
  accessToken: string | null
  setSession: (user: User, accessToken: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  accessToken: null,
  setSession: (user, accessToken) => {
    setAccessToken(accessToken)
    set({ status: 'authenticated', user, accessToken })
  },
  clearSession: () => {
    setAccessToken(null)
    set({ status: 'unauthenticated', user: null, accessToken: null })
  },
}))
