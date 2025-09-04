// App Constants
export const APP_NAME = 'NextJS 15 Boilerplate'
export const APP_DESCRIPTION = 'Production-ready NextJS 15 boilerplate with Auth, AI, and Payments'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// API Constants
export const API_ROUTES = {
  AUTH: {
    SIGN_IN: '/api/auth/signin',
    SIGN_OUT: '/api/auth/signout',
    CALLBACK: '/api/auth/callback',
  },
  AI: {
    CHAT: '/api/ai/chat',
    BOTS: '/api/ai/bots',
  },
  PAYMENTS: {
    CHECKOUT: '/api/payments/checkout',
    WEBHOOKS: '/api/payments/webhooks',
  },
  HEALTH: '/api/health',
} as const

// Supabase Constants
export const SUPABASE_TABLES = {
  USERS: 'users',
  AI_CONVERSATIONS: 'ai_conversations',
  BOTS: 'bots',
  BOT_CONVERSATIONS: 'bot_conversations',
  SUBSCRIPTIONS: 'subscriptions',
} as const

// AI Constants
export const AI_MODELS = {
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  GPT_4: 'gpt-4',
  CLAUDE_3_HAIKU: 'claude-3-haiku',
  CLAUDE_3_SONNET: 'claude-3-sonnet',
} as const

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  HUGGINGFACE: 'huggingface',
} as const

// Stripe Constants
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const

// Validation Constants
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  BIO_MAX_LENGTH: 500,
  MESSAGE_MAX_LENGTH: 1000,
  BOT_NAME_MAX_LENGTH: 100,
  BOT_DESCRIPTION_MAX_LENGTH: 500,
  BOT_INSTRUCTIONS_MAX_LENGTH: 2000,
} as const

// UI Constants
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

// Time Constants
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const

// Rate Limiting
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  AI_REQUESTS_PER_HOUR: 100,
} as const

// Feature Flags
export const FEATURES = {
  AI_CHAT: true,
  CUSTOM_BOTS: true,
  PAYMENTS: true,
  EMAIL_NOTIFICATIONS: false, // Enable when email service is configured
  ANALYTICS: false, // Enable when analytics service is configured
} as const
