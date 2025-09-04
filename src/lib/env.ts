import { z } from 'zod'

const envSchema = z.object({
  // Next.js
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  
  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  
  // AI
  HUGGINGFACE_API_KEY: z.string(),
  OPENAI_API_KEY: z.string().optional(),
  
  // Email
  RESEND_API_KEY: z.string().optional(),

  // Monitoring & Analytics
  SENTRY_DSN: z.string().optional(),
  DATADOG_API_KEY: z.string().optional(),
  DATADOG_APPLICATION_ID: z.string().optional(),
  DATADOG_CLIENT_TOKEN: z.string().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),

  // Stripe Price IDs
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
  STRIPE_ENTERPRISE_MONTHLY_PRICE_ID: z.string().optional(),
})

export const env = envSchema.parse(process.env)
