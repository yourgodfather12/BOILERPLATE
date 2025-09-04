import { NextRequest } from 'next/server'
import { POST } from '@/app/api/payments/checkout/route'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Mock the dependencies
jest.mock('@/lib/supabase-server')
jest.mock('@/services/stripe')

const mockCreateServerSupabaseClient = createServerSupabaseClient as jest.MockedFunction<typeof createServerSupabaseClient>

describe('/api/payments/checkout', () => {
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
            single: jest.fn(() => ({
              data: {
                id: 'user123',
                email: 'test@example.com',
                stripe_customer_id: 'cus_123'
              },
              error: null
            }))
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            data: null,
            error: null
          }))
        }))
      }))
    }

    mockCreateServerSupabaseClient.mockResolvedValue(mockSupabaseClient)
  })

  describe('POST /api/payments/checkout', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Mock unauthenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user found' }
      })

      const request = new NextRequest('http://localhost:3000/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_123',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel'
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

    it('should return 400 when request validation fails', async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: '', // Empty price ID should fail
          successUrl: 'not-a-url', // Invalid URL
          cancelUrl: 'https://example.com/cancel'
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

    it('should create checkout session successfully', async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      // Mock Stripe service
      const mockStripeService = jest.requireMock('@/services/stripe').stripeService
      mockStripeService.createCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123'
      })

      const request = new NextRequest('http://localhost:3000/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_123',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.data.sessionId).toBe('cs_test_123')
      expect(result.data.url).toBe('https://checkout.stripe.com/pay/cs_test_123')

      expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith(
        'user123',
        'price_123',
        'https://example.com/success',
        'https://example.com/cancel'
      )
    })

    it('should sanitize URLs properly', async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      // Mock Stripe service
      const mockStripeService = jest.requireMock('@/services/stripe').stripeService
      mockStripeService.createCheckoutSession.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123'
      })

      const request = new NextRequest('http://localhost:3000/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_123',
          successUrl: '   https://example.com/success   ', // URLs with whitespace
          cancelUrl: 'https://example.com/cancel?param=<script>alert("xss")</script>' // URL with XSS attempt
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith(
        'user123',
        'price_123',
        'https://example.com/success', // Whitespace trimmed
        'https://example.com/cancel?param=alert("xss")' // XSS sanitized
      )
    })

    it('should handle user not found error', async () => {
      // Mock authenticated user but user lookup fails
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      // Mock user lookup failure
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: { message: 'User not found' }
            }))
          }))
        }))
      })

      // Mock Stripe service to throw user not found error
      const mockStripeService = jest.requireMock('@/services/stripe').stripeService
      mockStripeService.createCheckoutSession.mockRejectedValue(new Error('User not found'))

      const request = new NextRequest('http://localhost:3000/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_123',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(404)
      expect(result.type).toBe('NOT_FOUND')
      expect(result.message).toBe('User account not found')
    })

    it('should handle Stripe service errors', async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      // Mock Stripe service failure
      const mockStripeService = jest.requireMock('@/services/stripe').stripeService
      mockStripeService.createCheckoutSession.mockRejectedValue(new Error('Failed to create checkout session'))

      const request = new NextRequest('http://localhost:3000/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_123',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.type).toBe('INTERNAL_ERROR')
      expect(result.message).toBe('Payment service temporarily unavailable')
    })

    it('should handle generic errors gracefully', async () => {
      // Mock authenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user123' } },
        error: null
      })

      // Mock an unexpected error
      mockSupabaseClient.from.mockImplementation(() => {
        throw new Error('Unexpected database error')
      })

      const request = new NextRequest('http://localhost:3000/api/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({
          priceId: 'price_123',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel'
        }),
        headers: {
          'content-type': 'application/json'
        }
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.type).toBe('INTERNAL_ERROR')
      expect(result.message).toBe('Internal server error')
    })
  })
})
