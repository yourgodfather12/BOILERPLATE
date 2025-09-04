import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { Database } from '@/types/database'
import { stripeService } from '@/services/stripe'
import { APIResponse, APIErrorHandler, RequestValidator, APIErrorType } from '@/lib/api-utils'

const checkoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  successUrl: z.string().url('Valid success URL is required'),
  cancelUrl: z.string().url('Valid cancel URL is required'),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      const error = APIErrorHandler.createError(
        APIErrorType.UNAUTHORIZED,
        'Authentication required'
      )
      return APIResponse.error(error)
    }

    // Parse and validate request body
    const validation = await RequestValidator.parseJSON(request, checkoutSchema)

    if (!validation.success) {
      return APIResponse.error(validation.error)
    }

    const { priceId, successUrl, cancelUrl } = validation.data

    // Sanitize URLs
    const sanitizedSuccessUrl = RequestValidator.sanitizeInput(successUrl, {
      maxLength: 2000,
      fieldName: 'successUrl'
    })

    const sanitizedCancelUrl = RequestValidator.sanitizeInput(cancelUrl, {
      maxLength: 2000,
      fieldName: 'cancelUrl'
    })

    // Create checkout session
    const session = await stripeService.createCheckoutSession(
      user.id,
      priceId,
      sanitizedSuccessUrl,
      sanitizedCancelUrl
    )

    logger.info('Checkout session created', {
      userId: user.id,
      sessionId: session.id,
      priceId,
    })

    return APIResponse.success({
      sessionId: session.id,
      url: session.url,
    })

  } catch (error: any) {
    if (error.message?.includes('User not found')) {
      const userError = APIErrorHandler.createError(
        APIErrorType.NOT_FOUND,
        'User account not found'
      )
      return APIResponse.error(userError)
    }

    if (error.message?.includes('Failed to create checkout session')) {
      const checkoutError = APIErrorHandler.createError(
        APIErrorType.INTERNAL_ERROR,
        'Payment service temporarily unavailable'
      )
      return APIResponse.error(checkoutError)
    }

    const apiError = APIErrorHandler.handleGenericError(error)
    return APIResponse.error(apiError)
  }
}