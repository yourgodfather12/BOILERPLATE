import { env } from './src/lib/env'
import { logger } from './src/lib/logger'

export async function register() {
  // Only run instrumentation in production or when explicitly enabled
  const shouldInstrument =
    process.env.NODE_ENV === 'production' ||
    process.env.ENABLE_INSTRUMENTATION === 'true'

  if (!shouldInstrument) {
    logger.info('Instrumentation disabled - running in development mode')
    return
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Initialize Sentry for error tracking
      if (env.SENTRY_DSN) {
        await import('./src/lib/sentry.server.config')
        logger.info('Sentry server instrumentation initialized')
      }

      // Initialize DataDog for performance monitoring
      if (env.DATADOG_API_KEY) {
        await import('./src/lib/datadog.config')
        logger.info('DataDog instrumentation initialized')
      }

      // Initialize custom metrics collection
      await import('./src/lib/metrics.config')
      logger.info('Custom metrics collection initialized')

    } catch (error) {
      logger.error('Failed to initialize server instrumentation:', error)
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    try {
      // Initialize Sentry for edge runtime
      if (env.SENTRY_DSN) {
        await import('./src/lib/sentry.edge.config')
        logger.info('Sentry edge instrumentation initialized')
      }

      // Initialize Vercel Analytics
      if (env.VERCEL_ANALYTICS_ID) {
        await import('./src/lib/vercel-analytics.config')
        logger.info('Vercel Analytics initialized')
      }

    } catch (error) {
      logger.error('Failed to initialize edge instrumentation:', error)
    }
  }

  logger.info('Instrumentation registration completed')
}

// Global error handler for unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  // Allow some time for logging before exiting
  setTimeout(() => {
    process.exit(1)
  }, 1000)
})
