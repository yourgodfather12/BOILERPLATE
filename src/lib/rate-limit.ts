import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'

// In-memory rate limiting store (for production, use Redis)
interface RateLimitEntry {
  count: number
  resetTime: number
}

class MemoryRateLimitStore {
  private store = new Map<string, RateLimitEntry>()

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key)
    if (entry && Date.now() > entry.resetTime) {
      this.store.delete(key)
      return undefined
    }
    return entry
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry)
  }

  increment(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now()
    let entry = this.get(key)

    if (!entry || now > entry.resetTime) {
      entry = { count: 1, resetTime: now + windowMs }
    } else {
      entry.count++
    }

    this.set(key, entry)
    return entry
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

const store = new MemoryRateLimitStore()

// Clean up expired entries every 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000)

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  max: number // Maximum requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Skip rate limiting for successful requests
  skipFailedRequests?: boolean // Skip rate limiting for failed requests
}

export interface RateLimitResult {
  success: boolean
  limit?: number
  remaining?: number
  resetTime?: number
  error?: string
}

export function createRateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options

  return async function rateLimit(
    request: NextRequest,
    identifier?: string
  ): Promise<RateLimitResult> {
    // Generate identifier (IP address or user ID)
    const ip = identifier || request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const key = `rate_limit:${ip}`

    const entry = store.increment(key, windowMs)
    const remaining = Math.max(0, max - entry.count)

    logger.info('Rate limit check', {
      ip: ip.substring(0, 10) + '...', // Log partial IP for privacy
      count: entry.count,
      remaining,
      resetTime: new Date(entry.resetTime).toISOString()
    })

    if (entry.count > max) {
      logger.warn('Rate limit exceeded', {
        ip: ip.substring(0, 10) + '...',
        count: entry.count,
        max,
        resetTime: new Date(entry.resetTime).toISOString()
      })

      return {
        success: false,
        limit: max,
        remaining: 0,
        resetTime: entry.resetTime,
        error: message
      }
    }

    return {
      success: true,
      limit: max,
      remaining,
      resetTime: entry.resetTime
    }
  }
}

// Pre-configured rate limiters
export const strictRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many requests. Please wait before trying again.'
})

export const moderateRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Rate limit exceeded. Please slow down.'
})

export const generousRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Rate limit exceeded. Please try again later.'
})

// Helper function to apply rate limiting to API routes
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  rateLimiter = moderateRateLimit,
  identifier?: string
): Promise<NextResponse> {
  const rateLimitResult = await rateLimiter(request, identifier)

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: rateLimitResult.error,
        retryAfter: Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000)
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit?.toString() || '',
          'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime?.toString() || '',
          'Retry-After': Math.ceil((rateLimitResult.resetTime! - Date.now()) / 1000).toString()
        }
      }
    )
  }

  // Add rate limit headers to successful responses
  const response = await handler()

  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit?.toString() || '')
  response.headers.set('X-RateLimit-Remaining', (rateLimitResult.remaining! - 1).toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime?.toString() || '')

  return response
}
