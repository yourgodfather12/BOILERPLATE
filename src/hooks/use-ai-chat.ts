import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logger } from '@/lib/logger'
import { aiChatSchema, type AIChatFormData } from '@/lib/validations'

interface AIResponse {
  content: string
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  finish_reason: string
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UseAIChatOptions {
  model?: string
  onSuccess?: (response: AIResponse) => void
  onError?: (error: Error) => void
}

export function useAIChat(options: UseAIChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const queryClient = useQueryClient()

  // Fetch conversation history
  const { data: conversationHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: async () => {
      const response = await fetch('/api/ai/chat')
      if (!response.ok) throw new Error('Failed to fetch conversation history')
      return response.json()
    },
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const validation = aiChatSchema.safeParse({ message })
      if (!validation.success) {
        throw new Error('Invalid message')
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          model: options.model || 'gpt-3.5-turbo',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      return response.json()
    },
    onMutate: () => {
      setIsTyping(true)
    },
    onSuccess: (data, message) => {
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, userMessage, assistantMessage])
      setIsTyping(false)

      // Invalidate conversation history
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })

      options.onSuccess?.(data)
      logger.info('AI chat message sent successfully', {
        messageLength: message.length,
        responseLength: data.message.length,
        model: data.model,
      })
    },
    onError: (error) => {
      setIsTyping(false)
      options.onError?.(error as Error)
      logger.error('AI chat error:', error)
    },
  })

  const sendMessage = useCallback(
    (message: string) => {
      if (!message.trim()) return

      sendMessageMutation.mutate(message)
    },
    [sendMessageMutation]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user')
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content)
    }
  }, [messages, sendMessage])

  return {
    messages,
    isTyping,
    isLoading: sendMessageMutation.isPending,
    conversationHistory: conversationHistory?.conversations || [],
    isLoadingHistory,
    sendMessage,
    clearMessages,
    retryLastMessage,
    error: sendMessageMutation.error,
  }
}

// Hook for managing chat sessions
export function useChatSession(sessionId?: string) {
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId)

  const createNewSession = useCallback(() => {
    const newSessionId = crypto.randomUUID()
    setCurrentSessionId(newSessionId)
    return newSessionId
  }, [])

  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId)
  }, [])

  return {
    currentSessionId,
    createNewSession,
    switchSession,
  }
}
