import { env } from './env'
import { logger } from './logger'

// Custom metrics collection for performance monitoring
export class MetricsCollector {
  private metrics: Map<string, number> = new Map()

  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    this.metrics.set(name, value)

    // In production, you would send this to your monitoring service
    if (process.env.NODE_ENV === 'production') {
      logger.info('Metric recorded:', { name, value, tags })
    }
  }

  incrementCounter(name: string, tags?: Record<string, string>) {
    const currentValue = this.metrics.get(name) || 0
    this.recordMetric(name, currentValue + 1, tags)
  }

  recordTiming(name: string, startTime: number, tags?: Record<string, string>) {
    const duration = Date.now() - startTime
    this.recordMetric(`${name}_duration`, duration, tags)
  }

  getMetrics() {
    return Object.fromEntries(this.metrics)
  }
}

export const metrics = new MetricsCollector()

// Performance monitoring for API routes
export function withMetrics<T extends any[]>(
  fn: (...args: T) => Promise<any>,
  metricName: string
) {
  return async (...args: T) => {
    const startTime = Date.now()

    try {
      const result = await fn(...args)
      metrics.recordTiming(metricName, startTime, { status: 'success' })
      return result
    } catch (error) {
      metrics.recordTiming(metricName, startTime, { status: 'error' })
      throw error
    }
  }
}

// Web Vitals tracking
export function trackWebVitals(metric: any) {
  if (typeof window !== 'undefined') {
    metrics.recordMetric(`web_vitals_${metric.name}`, metric.value, {
      rating: metric.rating,
      navigationType: metric.navigationType,
    })
  }
}
