import { Analytics } from '@vercel/analytics/react'
import { env } from './env'

// Initialize Vercel Analytics
if (typeof window !== 'undefined' && env.VERCEL_ANALYTICS_ID) {
  // This will be handled by the Analytics component in the layout
  console.log('Vercel Analytics initialized')
}
