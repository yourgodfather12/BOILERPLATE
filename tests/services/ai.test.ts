import { generateResponse } from '@/services/ai'

// Mock the fetch function
global.fetch = jest.fn()

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateResponse', () => {
    it('should generate AI response successfully', async () => {
      const mockResponse = {
        content: 'This is a test response',
        model: 'gpt-3.5-turbo',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30,
        },
        finish_reason: 'stop',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: mockResponse.content }, finish_reason: 'stop' }],
          usage: mockResponse.usage,
          model: mockResponse.model,
        }),
      } as Response)

      const result = await generateResponse('Test prompt', 'gpt-3.5-turbo', 'user123')

      expect(result).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer undefined', // Would be the actual API key
            'Content-Type': 'application/json',
          }),
          body: expect.any(String),
        })
      )
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      } as Response)

      await expect(
        generateResponse('Test prompt', 'gpt-3.5-turbo', 'user123')
      ).rejects.toThrow('Failed to generate AI response')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        generateResponse('Test prompt', 'gpt-3.5-turbo', 'user123')
      ).rejects.toThrow('Network error')
    })
  })
})
