import { env } from './env'
import { logger } from './logger'

// Secure API key management
class APIKeyManager {
  private keys: Map<string, string> = new Map()

  constructor() {
    this.initializeKeys()
  }

  private initializeKeys() {
    // Only store keys that are actually configured
    if (env.OPENAI_API_KEY) {
      this.keys.set('openai', env.OPENAI_API_KEY)
    }

    if (env.HUGGINGFACE_API_KEY) {
      this.keys.set('huggingface', env.HUGGINGFACE_API_KEY)
    }

    if (env.RESEND_API_KEY) {
      this.keys.set('resend', env.RESEND_API_KEY)
    }

    logger.info(`API Key Manager initialized with ${this.keys.size} keys`)
  }

  // Secure key retrieval with validation
  getKey(provider: string): string | null {
    const key = this.keys.get(provider)

    if (!key) {
      logger.warn(`API key requested for unknown provider: ${provider}`)
      return null
    }

    // Basic validation - ensure key is not empty and has reasonable length
    if (key.length < 10) {
      logger.error(`Invalid API key length for provider: ${provider}`)
      return null
    }

    // Log key usage for monitoring (without exposing the key)
    logger.info(`API key accessed for provider: ${provider}`, {
      keyLength: key.length,
      keyPrefix: key.substring(0, 4) + '...'
    })

    return key
  }

  // Check if a provider is configured
  isProviderConfigured(provider: string): boolean {
    return this.keys.has(provider)
  }

  // Get list of configured providers (for debugging)
  getConfiguredProviders(): string[] {
    return Array.from(this.keys.keys())
  }

  // Validate API key format (basic validation)
  validateKeyFormat(provider: string, key: string): boolean {
    if (!key || key.length < 10) {
      return false
    }

    // Provider-specific validations
    switch (provider) {
      case 'openai':
        return key.startsWith('sk-')
      case 'huggingface':
        return key.length > 20 // HuggingFace tokens are typically long
      case 'resend':
        return key.startsWith('re_')
      default:
        return true // Generic validation
    }
  }
}

// Export singleton instance
export const apiKeyManager = new APIKeyManager()

// Rate limiting for API usage
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map()
  private readonly windowMs = 60 * 1000 // 1 minute
  private readonly maxRequests = 10 // Max requests per minute per user

  isRateLimited(userId: string): boolean {
    const now = Date.now()
    const userRequests = this.requests.get(userId)

    if (!userRequests) {
      this.requests.set(userId, { count: 1, resetTime: now + this.windowMs })
      return false
    }

    if (now > userRequests.resetTime) {
      // Reset window
      this.requests.set(userId, { count: 1, resetTime: now + this.windowMs })
      return false
    }

    if (userRequests.count >= this.maxRequests) {
      return true
    }

    userRequests.count++
    return false
  }

  getRemainingRequests(userId: string): number {
    const userRequests = this.requests.get(userId)
    if (!userRequests) return this.maxRequests

    const now = Date.now()
    if (now > userRequests.resetTime) {
      return this.maxRequests
    }

    return Math.max(0, this.maxRequests - userRequests.count)
  }

  getResetTime(userId: string): number {
    const userRequests = this.requests.get(userId)
    return userRequests?.resetTime || Date.now() + this.windowMs
  }
}

// Export rate limiter singleton
export const rateLimiter = new RateLimiter()

// Secure header validation
export function validateRequestHeaders(headers: Headers): { isValid: boolean; error?: string } {
  // Check for suspicious headers that might indicate attacks
  const suspiciousHeaders = [
    'x-forwarded-for', // Can be spoofed
    'x-real-ip',
    'x-client-ip'
  ]

  for (const header of suspiciousHeaders) {
    if (headers.get(header)) {
      logger.warn(`Suspicious header detected: ${header}`)
    }
  }

  // Check content type for API requests
  const contentType = headers.get('content-type')
  if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
    return {
      isValid: false,
      error: 'Invalid content type'
    }
  }

  return { isValid: true }
}
