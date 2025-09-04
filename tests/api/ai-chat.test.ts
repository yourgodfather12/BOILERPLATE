import { NextRequest } from 'next/server'
import { POST, GET } from '@/app/api/ai/chat/route'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Mock the dependencies
jest.mock('@/lib/supabase-server')
jest.mock('@/services/ai')
jest.mock('@/lib/rate-limit')
jest.mock('@/lib/api-keys')
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    url,
    method: init?.method || 'GET',
    headers: {
      get: jest.fn((key) => init?.headers?.[key]),
      set: jest.fn(),
      append: jest.fn(),
      has: jest.fn(),
      delete: jest.fn(),
    },
    json: jest.fn().mockResolvedValue(init?.body ? JSON.parse(init.body) : {}),
    text: jest.fn().mockResolvedValue(init?.body || ''),
    ip: '127.0.0.1',
    cookies: {
      get: jest.fn(),
      getAll: jest.fn().mockReturnValue([]),
      set: jest.fn(),
      setAll: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    },
    ...init
  })),
  NextResponse: {
    json: jest.fn().mockImplementation((data, options) => ({
      status: options?.status || 200,
      json: jest.fn().mockResolvedValue(data),
      headers: new Map()
    }))
  }
}))

const mockCreateServerSupabaseClient = createServerSupabaseClient as jest.MockedFunction<typeof createServerSupabaseClient>

describe('/api/ai/chat', () => {
  let mockSupabaseClient: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn()
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                single: jest.fn(),
                data: [],
                error: null
              }))
            }))
          }))
        })),
        insert: jest.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }

    mockCreateServerSupabaseClient.mockResolvedValue(mockSupabaseClient)
  })

  describe('POST /api/ai/chat', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock unauthenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user found' }
      })

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Test message',
          model: 'gpt-3.5-turbo'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.type).toBe('UNAUTHORIZED')
      expect(result.message).toBe('Authentication required')
    })

    it('should return 400 when request body is invalid', async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: '', // Empty message should fail validation
          model: 'invalid-model'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.type).toBe('VALIDATION_ERROR')
      expect(result.details).toBeDefined()
    })

    it('should return 200 with AI response when request is valid', async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      // Mock AI service
      const mockGenerateResponse = jest.requireMock('@/services/ai').generateResponse
      mockGenerateResponse.mockResolvedValue({
        content: 'This is a test response',
        model: 'gpt-3.5-turbo',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        },
        finish_reason: 'stop'
      })

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello, how are you?',
          model: 'gpt-3.5-turbo'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.message).toBe('This is a test response')
      expect(result.data.model).toBe('gpt-3.5-turbo')
      expect(result.data.usage).toBeDefined()
    })

    it('should handle rate limiting', async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      // Mock rate limiter
      const mockRateLimiter = jest.requireMock('@/lib/rate-limit').moderateRateLimit
      mockRateLimiter.mockResolvedValue({
        success: false,
        error: 'Rate limit exceeded. Try again in 60 seconds.',
        resetTime: Date.now() + 60000
      })

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Test message',
          model: 'gpt-3.5-turbo'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(429)
      expect(result.type).toBe('RATE_LIMITED')
      expect(result.message).toContain('Rate limit exceeded')
    })

    it('should sanitize input properly', async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      // Mock AI service
      const mockGenerateResponse = jest.requireMock('@/services/ai').generateResponse
      mockGenerateResponse.mockResolvedValue({
        content: 'Response to sanitized input',
        model: 'gpt-3.5-turbo',
        usage: { prompt_tokens: 5, completion_tokens: 10, total_tokens: 15 },
        finish_reason: 'stop'
      })

      const request = new NextRequest('http://localhost:3000/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: '   <script>alert("xss")</script> Hello!   ', // Input with XSS and whitespace
          model: 'gpt-3.5-turbo'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockGenerateResponse).toHaveBeenCalledWith(
        'alert("xss") Hello!', // XSS removed, whitespace trimmed
        'gpt-3.5-turbo',
        'user123',
        expect.any(Object)
      )
    })
  })

  describe('GET /api/ai/chat', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock unauthenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user found' }
      })

      const request = new NextRequest('http://localhost:3000/api/ai/chat')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(401)
      expect(result.type).toBe('UNAUTHORIZED')
    })

    it('should return conversation history when authenticated', async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      // Mock conversation data
      const mockConversations = [
        {
          id: 'conv1',
          prompt: 'Hello',
          response: 'Hi there!',
          model: 'gpt-3.5-turbo',
          created_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                data: mockConversations,
                error: null
              }))
            }))
          }))
        }))
      })

      const request = new NextRequest('http://localhost:3000/api/ai/chat')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.conversations).toEqual(mockConversations)
    })

    it('should handle database errors gracefully', async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      // Mock database error
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                data: null,
                error: { message: 'Database connection failed' }
              }))
            }))
          }))
        }))
      })

      const request = new NextRequest('http://localhost:3000/api/ai/chat')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.type).toBe('INTERNAL_ERROR')
    })
  })
})
