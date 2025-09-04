import { logger } from './logger'

// Sensitive data patterns to sanitize
const SENSITIVE_PATTERNS = [
  // API Keys
  /(sk-|pk_|api_key|apikey|secret_key|service_role_key)\s*[:=]\s*['"]?([a-zA-Z0-9_-]{10,})['"]?/gi,
  /(xoxb-|xoxp-|xoxa-)[0-9]+-[0-9]+-[a-zA-Z0-9]+/gi, // Slack tokens
  /(ghp_|github_pat_)[a-zA-Z0-9_]{36}/gi, // GitHub tokens

  // Database connection strings
  /(postgresql|mysql|mongodb):\/\/([^:]+):([^@]+)@/gi,
  /mongodb\+srv:\/\/([^:]+):([^@]+)@/gi,

  // JWT tokens
  /eyJ[A-Za-z0-9-_]*\.eyJ[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*/gi,

  // Generic secrets
  /(password|passwd|pwd|secret|token|key|auth)\s*[:=]\s*['"]?([^'"\s]{8,})['"]?/gi,

  // Email addresses in logs
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,

  // IP addresses (partial masking)
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,

  // Credit card patterns
  /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
]

// Fields that should never be logged
const SENSITIVE_FIELDS = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'key',
  'apikey',
  'api_key',
  'secret_key',
  'service_role_key',
  'stripe_secret_key',
  'openai_api_key',
  'huggingface_api_key',
  'resend_api_key',
  'sentry_dsn',
  'datadog_api_key',
  'datadog_client_token',
  'supabase_service_role_key',
  'supabase_anon_key'
]

export class SecureLogger {
  private static sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      let sanitized = value

      // Apply all sensitive patterns
      SENSITIVE_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, (match: string, ...groups: any[]) => {
          // For API keys and secrets, replace with [REDACTED]
          if (groups.length > 0 && groups[0]) {
            return `${groups[0]}: [REDACTED]`
          }
          return '[REDACTED]'
        })
      })

      return sanitized
    }

    if (Array.isArray(value)) {
      return value.map(item => this.sanitizeValue(item))
    }

    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value)
    }

    return value
  }

  private static sanitizeObject(obj: any): any {
    const sanitized: any = {}

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase()

      // Skip sensitive fields entirely
      if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]'
        continue
      }

      // Sanitize the value
      sanitized[key] = this.sanitizeValue(value)
    }

    return sanitized
  }

  private static sanitizeMessage(message: string): string {
    let sanitized = message

    SENSITIVE_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]')
    })

    return sanitized
  }

  static info(message: string, meta?: any): void {
    const sanitizedMessage = this.sanitizeMessage(message)
    const sanitizedMeta = meta ? this.sanitizeObject(meta) : undefined

    logger.info(sanitizedMessage, sanitizedMeta)
  }

  static warn(message: string, meta?: any): void {
    const sanitizedMessage = this.sanitizeMessage(message)
    const sanitizedMeta = meta ? this.sanitizeObject(meta) : undefined

    logger.warn(sanitizedMessage, sanitizedMeta)
  }

  static error(message: string, error?: any, meta?: any): void {
    const sanitizedMessage = this.sanitizeMessage(message)

    // Sanitize error object
    let sanitizedError = error
    if (error && typeof error === 'object') {
      sanitizedError = this.sanitizeObject(error)

      // Special handling for Error objects
      if (error instanceof Error) {
        sanitizedError = {
          name: error.name,
          message: this.sanitizeMessage(error.message),
          stack: process.env.NODE_ENV === 'development' ? error.stack : '[REDACTED]'
        }
      }
    }

    const sanitizedMeta = meta ? this.sanitizeObject(meta) : undefined

    logger.error(sanitizedMessage, sanitizedError, sanitizedMeta)
  }

  static debug(message: string, meta?: any): void {
    const sanitizedMessage = this.sanitizeMessage(message)
    const sanitizedMeta = meta ? this.sanitizeObject(meta) : undefined

    logger.debug(sanitizedMessage, sanitizedMeta)
  }

  // Safe logging for user data - only logs non-sensitive information
  static userAction(userId: string, action: string, additionalData?: any): void {
    const safeData = {
      userId: userId.substring(0, 8) + '...', // Partial user ID
      action,
      timestamp: new Date().toISOString(),
      ...(additionalData ? this.sanitizeObject(additionalData) : {})
    }

    logger.info(`User action: ${action}`, safeData)
  }

  // Safe logging for API calls
  static apiCall(method: string, endpoint: string, statusCode: number, userId?: string): void {
    const safeData = {
      method,
      endpoint,
      statusCode,
      ...(userId ? { userId: userId.substring(0, 8) + '...' } : {}),
      timestamp: new Date().toISOString()
    }

    logger.info(`API Call: ${method} ${endpoint}`, safeData)
  }

  // Safe logging for errors without exposing sensitive data
  static safeError(context: string, error: any, userId?: string): void {
    const errorInfo = {
      context,
      errorType: error?.name || 'UnknownError',
      message: error?.message ? this.sanitizeMessage(error.message) : 'No message',
      ...(userId ? { userId: userId.substring(0, 8) + '...' } : {}),
      timestamp: new Date().toISOString()
    }

    // In production, don't log stack traces
    if (process.env.NODE_ENV === 'development' && error?.stack) {
      errorInfo.stack = error.stack
    }

    logger.error(`Safe error in ${context}`, errorInfo)
  }
}
