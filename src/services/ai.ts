import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { SecureLogger } from '@/lib/secure-logger'
import { createServerSupabaseClientAnon } from '@/lib/supabase'
import { apiKeyManager, rateLimiter, validateRequestHeaders } from '@/lib/api-keys'

export interface AIResponse {
  content: string
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  finish_reason: string
}

export interface AIProvider {
  generateResponse(prompt: string, options?: AIOptions): Promise<AIResponse>
  generateEmbedding(text: string): Promise<number[]>
}

export interface AIOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

class OpenAIProvider implements AIProvider {
  private apiKey: string
  private baseURL = 'https://api.openai.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateResponse(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      max_tokens = 1000,
    } = options

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          max_tokens,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const choice = data.choices[0]

      return {
        content: choice.message.content,
        model: data.model,
        usage: data.usage,
        finish_reason: choice.finish_reason,
      }
    } catch (error) {
      SecureLogger.safeError('OpenAI API call', error)
      throw new Error('Failed to generate AI response')
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseURL}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text,
        }),
      })

      if (!response.ok) {
        SecureLogger.safeError('OpenAI Embeddings API', new Error(`HTTP ${response.status}`))
        throw new Error(`OpenAI Embeddings API error: ${response.status}`)
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      SecureLogger.safeError('OpenAI Embeddings', error)
      throw new Error('Failed to generate embedding')
    }
  }
}

class HuggingFaceProvider implements AIProvider {
  private apiKey: string
  private baseURL = 'https://api-inference.huggingface.co'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateResponse(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
    const { model = 'microsoft/DialoGPT-large' } = options

    try {
      const response = await fetch(`${this.baseURL}/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: options.max_tokens || 100,
            temperature: options.temperature || 0.7,
            return_full_text: false,
          },
        }),
      })

      if (!response.ok) {
        SecureLogger.safeError('HuggingFace API', new Error(`HTTP ${response.status}`))
        throw new Error(`Hugging Face API error: ${response.status}`)
      }

      const data = await response.json()
      const generatedText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text

      return {
        content: generatedText || 'No response generated',
        model,
        usage: {
          prompt_tokens: prompt.split(' ').length,
          completion_tokens: generatedText?.split(' ').length || 0,
          total_tokens: prompt.split(' ').length + (generatedText?.split(' ').length || 0),
        },
        finish_reason: 'stop',
      }
    } catch (error) {
      SecureLogger.safeError('HuggingFace API', error)
      throw new Error('Failed to generate AI response')
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseURL}/models/sentence-transformers/all-MiniLM-L6-v2`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
        }),
      })

      if (!response.ok) {
        SecureLogger.safeError('HuggingFace Embeddings API', new Error(`HTTP ${response.status}`))
        throw new Error(`Hugging Face Embeddings API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      SecureLogger.safeError('HuggingFace Embeddings', error)
      throw new Error('Failed to generate embedding')
    }
  }
}

// Factory function to get AI provider (legacy - use getSecureAIProvider instead)
function getAIProvider(): AIProvider | null {
  if (env.OPENAI_API_KEY) {
    return new OpenAIProvider(env.OPENAI_API_KEY)
  } else if (env.HUGGINGFACE_API_KEY) {
    return new HuggingFaceProvider(env.HUGGINGFACE_API_KEY)
  }
  return null
}

// Secure factory function using API key manager
function getSecureAIProvider(): AIProvider | null {
  if (apiKeyManager.isProviderConfigured('openai')) {
    const key = apiKeyManager.getKey('openai')
    if (key) {
      return new OpenAIProvider(key)
    }
  }

  if (apiKeyManager.isProviderConfigured('huggingface')) {
    const key = apiKeyManager.getKey('huggingface')
    if (key) {
      return new HuggingFaceProvider(key)
    }
  }

  return null
}

export async function generateResponse(
  prompt: string,
  model: string,
  userId: string,
  headers?: Headers
): Promise<AIResponse> {
  // Validate request headers if provided
  if (headers) {
    const validation = validateRequestHeaders(headers)
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid request')
    }
  }

  // Check rate limiting
  if (rateLimiter.isRateLimited(userId)) {
    const resetTime = rateLimiter.getResetTime(userId)
    const remainingMs = resetTime - Date.now()
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(remainingMs / 1000)} seconds.`)
  }

  // Get secure provider
  const provider = getSecureAIProvider()

  if (!provider) {
    throw new Error('AI service is not properly configured')
  }

  try {
    // Generate AI response
    const response = await provider.generateResponse(prompt, { model })

    // Save conversation to database (only save if user is authenticated)
    if (userId) {
      await saveConversation(userId, prompt, response.content, model)
    }

    return response
  } catch (error) {
    SecureLogger.safeError('AI Response Generation', error, userId)
    throw error
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const provider = getSecureAIProvider()
  if (!provider) {
    throw new Error('AI service is not properly configured')
  }
  return provider.generateEmbedding(text)
}

export async function saveConversation(
  userId: string,
  prompt: string,
  response: string,
  model: string,
  supabaseClient?: any
) {
  try {
    const client = supabaseClient || createServerSupabaseClientAnon()

    const { error } = await client
      .from('ai_conversations')
      .insert({
        user_id: userId,
        prompt,
        response,
        model,
        created_at: new Date().toISOString(),
      })

    if (error) {
      logger.error('Error saving conversation:', error)
      // Don't throw error for conversation saving failures
    }
  } catch (error) {
    logger.error('Save conversation error:', error)
    // Don't throw error for conversation saving failures
  }
}

export async function getUserConversations(userId: string, limit = 50, supabaseClient?: any) {
  try {
    const client = supabaseClient || createServerSupabaseClientAnon()

    const { data, error } = await client
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    logger.error('Get user conversations error:', error)
    throw error
  }
}