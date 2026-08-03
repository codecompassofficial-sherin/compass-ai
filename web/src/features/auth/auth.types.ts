export type Role = 'USER' | 'ADMIN'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: Role
  isEmailVerified: boolean
  avatarUrl?: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  firstName: string
  lastName: string
  email: string
  password: string
}
