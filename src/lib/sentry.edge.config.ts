import * as Sentry from '@sentry/nextjs'
import { env } from './env'

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 0.1, // Lower sample rate for edge runtime
    environment: process.env.NODE_ENV,
    integrations: [
      Sentry.httpIntegration(),
    ],
    beforeSend(event) {
      // Filter out development errors
      if (process.env.NODE_ENV === 'development') {
        return null
      }
      return event
    },
  })
}
