import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { logger } from './logger'

// Standardized API error types
export enum APIErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT'
}

// Standardized error response interface
export interface APIError {
  type: APIErrorType
  message: string
  details?: any
  code?: string
}

// Standardized success response interface
export interface APISuccess<T = any> {
  success: true
  data: T
  message?: string
}

// Input sanitization utilities
export class InputSanitizer {
  // Sanitize text input - remove potentially dangerous characters
  static sanitizeText(input: string, maxLength = 1000): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    // Remove null bytes and other control characters
    let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

    // Trim whitespace
    sanitized = sanitized.trim()

    // Limit length
    if (maxLength > 0 && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength)
    }

    return sanitized
  }

  // Sanitize email addresses
  static sanitizeEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      return ''
    }

    const sanitized = email.toLowerCase().trim()

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitized)) {
      throw new Error('Invalid email format')
    }

    return sanitized
  }

  // Sanitize URLs
  static sanitizeUrl(url: string): string {
    if (!url || typeof url !== 'string') {
      return ''
    }

    try {
      const urlObj = new URL(url)
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('Invalid URL protocol')
      }
      return urlObj.toString()
    } catch {
      throw new Error('Invalid URL format')
    }
  }

  // Sanitize HTML content (basic XSS prevention)
  static sanitizeHtml(input: string): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    // Remove script tags and other dangerous elements
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
  }

  // Validate and sanitize file names
  static sanitizeFileName(filename: string): string {
    if (!filename || typeof filename !== 'string') {
      return ''
    }

    // Remove path traversal attempts
    const sanitized = filename
      .replace(/\.\./g, '') // Remove ..
      .replace(/[<>:"|?*]/g, '') // Remove invalid characters
      .replace(/^\.+/, '') // Remove leading dots
      .trim()

    return sanitized
  }
}

// Error handling utilities
export class APIErrorHandler {
  static createError(
    type: APIErrorType,
    message: string,
    details?: any,
    statusCode?: number
  ): APIError {
    return {
      type,
      message,
      details: details || undefined
    }
  }

  static handleZodError(error: ZodError): APIError {
    const details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))

    return this.createError(
      APIErrorType.VALIDATION_ERROR,
      'Validation failed',
      details
    )
  }

  static handleDatabaseError(error: any): APIError {
    logger.error('Database error:', error)

    // Don't expose internal database errors
    return this.createError(
      APIErrorType.INTERNAL_ERROR,
      'Database operation failed'
    )
  }

  static handleAuthError(error: any): APIError {
    logger.error('Authentication error:', error)

    return this.createError(
      APIErrorType.UNAUTHORIZED,
      'Authentication failed'
    )
  }

  static handleGenericError(error: any): APIError {
    logger.error('Unexpected error:', error)

    // In development, show more details
    const isDevelopment = process.env.NODE_ENV === 'development'
    const message = isDevelopment
      ? `Internal server error: ${error.message}`
      : 'Internal server error'

    return this.createError(
      APIErrorType.INTERNAL_ERROR,
      message,
      isDevelopment ? error.stack : undefined
    )
  }
}

// Response utilities
export class APIResponse {
  static success<T>(
    data: T,
    message?: string,
    statusCode = 200
  ): NextResponse<APISuccess<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        message
      },
      { status: statusCode }
    )
  }

  static error(
    error: APIError,
    statusCode: number = this.getStatusCode(error.type)
  ): NextResponse<APIError> {
    logger.warn('API Error Response:', {
      type: error.type,
      message: error.message,
      statusCode
    })

    return NextResponse.json(error, { status: statusCode })
  }

  private static getStatusCode(errorType: APIErrorType): number {
    switch (errorType) {
      case APIErrorType.VALIDATION_ERROR:
        return 400
      case APIErrorType.UNAUTHORIZED:
        return 401
      case APIErrorType.FORBIDDEN:
        return 403
      case APIErrorType.NOT_FOUND:
        return 404
      case APIErrorType.CONFLICT:
        return 409
      case APIErrorType.RATE_LIMITED:
        return 429
      case APIErrorType.INTERNAL_ERROR:
      default:
        return 500
    }
  }
}

// Request validation utilities
export class RequestValidator {
  static async parseJSON<T>(
    request: Request,
    schema: any
  ): Promise<{ success: true; data: T } | { success: false; error: APIError }> {
    try {
      const body = await request.json()
      const result = schema.safeParse(body)

      if (!result.success) {
        return {
          success: false,
          error: APIErrorHandler.handleZodError(result.error)
        }
      }

      return {
        success: true,
        data: result.data as T
      }
    } catch (error) {
      return {
        success: false,
        error: APIErrorHandler.createError(
          APIErrorType.BAD_REQUEST,
          'Invalid JSON payload'
        )
      }
    }
  }

  static sanitizeInput(input: any, options: {
    maxLength?: number
    allowHtml?: boolean
    fieldName?: string
  } = {}): string {
    const { maxLength = 1000, allowHtml = false, fieldName = 'input' } = options

    if (typeof input !== 'string') {
      throw new Error(`${fieldName} must be a string`)
    }

    let sanitized = input

    if (!allowHtml) {
      sanitized = InputSanitizer.sanitizeHtml(sanitized)
    }

    sanitized = InputSanitizer.sanitizeText(sanitized, maxLength)

    if (!sanitized) {
      throw new Error(`${fieldName} cannot be empty`)
    }

    return sanitized
  }
}
