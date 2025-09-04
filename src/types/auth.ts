import type { User, Session } from '@supabase/supabase-js'

export interface AuthUser extends User {
  // Additional user properties can be added here
  name?: string
  avatar_url?: string
}

export interface AuthSession extends Session {
  user: AuthUser
}

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error: any }>
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends SignInCredentials {
  confirmPassword?: string
  name?: string
}

export interface ResetPasswordCredentials {
  email: string
}

export interface UpdateProfileData {
  name?: string
  avatar_url?: string
}

// OAuth providers
export type OAuthProvider = 'google' | 'github' | 'discord' | 'twitter'

// Auth events
export type AuthEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'

// Auth errors
export interface AuthError {
  message: string
  status?: number
}

// Role-based access control
export type UserRole = 'user' | 'admin' | 'moderator'

export interface UserPermissions {
  canCreateBots: boolean
  canAccessAI: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
}

// Subscription types
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete'

export interface UserSubscription {
  id: string
  status: SubscriptionStatus
  planId: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
}
