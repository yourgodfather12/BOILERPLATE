import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { Database } from '@/types/database'
import { generateResponse } from '@/services/ai'
import { APIResponse, APIErrorHandler, RequestValidator, APIErrorType } from '@/lib/api-utils'

const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  model: z.enum(['gpt-3.5-turbo', 'gpt-4', 'claude-3-haiku', 'claude-3-sonnet']).optional(),
  conversationId: z.string().optional(),
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
    const validation = await RequestValidator.parseJSON(request, chatSchema)

    if (!validation.success) {
      return APIResponse.error(validation.error)
    }

    const { message, model = 'gpt-3.5-turbo' } = validation.data

    // Sanitize input
    const sanitizedMessage = RequestValidator.sanitizeInput(message, {
      maxLength: 1000,
      fieldName: 'message'
    })

    // Generate AI response with security checks
    const aiResponse = await generateResponse(sanitizedMessage, model, user.id, headers())

    // Log the interaction
    logger.info('AI chat interaction', {
      userId: user.id,
      model,
      messageLength: sanitizedMessage.length,
      responseLength: aiResponse.content.length,
    })

    return APIResponse.success({
      message: aiResponse.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      finish_reason: aiResponse.finish_reason,
    })

  } catch (error: any) {
    // Handle specific error types
    if (error.message?.includes('Rate limit exceeded')) {
      const rateLimitError = APIErrorHandler.createError(
        APIErrorType.RATE_LIMITED,
        error.message
      )
      return APIResponse.error(rateLimitError, 429)
    }

    if (error.message?.includes('AI service is not properly configured')) {
      const serviceError = APIErrorHandler.createError(
        APIErrorType.INTERNAL_ERROR,
        'AI service temporarily unavailable'
      )
      return APIResponse.error(serviceError)
    }

    // Generic error handling
    const apiError = APIErrorHandler.handleGenericError(error)
    return APIResponse.error(apiError)
  }
}

export async function GET(request: NextRequest) {
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

    // Get user's chat history
    const { data: conversations, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      const dbError = APIErrorHandler.handleDatabaseError(error)
      return APIResponse.error(dbError)
    }

    return APIResponse.success({
      conversations: conversations || []
    })

  } catch (error: any) {
    const apiError = APIErrorHandler.handleGenericError(error)
    return APIResponse.error(apiError)
  }
}