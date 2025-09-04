import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { generateResponse, generateEmbedding } from './ai'

const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

export interface Bot {
  id: string
  name: string
  description: string
  instructions: string
  model: string
  temperature: number
  max_tokens: number
  user_id: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface BotConversation {
  id: string
  bot_id: string
  user_id: string
  messages: BotMessage[]
  created_at: string
  updated_at: string
}

export interface BotMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export class BotService {
  async createBot(userId: string, botData: Omit<Bot, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Bot> {
    try {
      const { data, error } = await supabase
        .from('bots')
        .insert({
          ...botData,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      logger.info('Bot created:', { botId: data.id, userId })
      return data as unknown as Bot
    } catch (error) {
      logger.error('Create bot error:', error)
      throw new Error('Failed to create bot')
    }
  }

  async getUserBots(userId: string): Promise<Bot[]> {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        throw error
      }

      return data as unknown as Bot[] || []
    } catch (error) {
      logger.error('Get user bots error:', error)
      throw new Error('Failed to fetch user bots')
    }
  }

  async getPublicBots(limit = 20): Promise<Bot[]> {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return data as unknown as Bot[] || []
    } catch (error) {
      logger.error('Get public bots error:', error)
      throw new Error('Failed to fetch public bots')
    }
  }

  async getBotById(botId: string, userId?: string): Promise<Bot | null> {
    try {
      let query = supabase
        .from('bots')
        .select('*')
        .eq('id', botId)

      // If user is not the owner, only return public bots
      if (userId) {
        query = query.or(`user_id.eq.${userId},is_public.eq.true`)
      } else {
        query = query.eq('is_public', true)
      }

      const { data, error } = await query.single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // Not found
        }
        throw error
      }

      return data as unknown as Bot | null
    } catch (error) {
      logger.error('Get bot by ID error:', error)
      throw new Error('Failed to fetch bot')
    }
  }

  async updateBot(botId: string, userId: string, updates: Partial<Bot>): Promise<Bot> {
    try {
      const { data, error } = await supabase
        .from('bots')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', botId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        throw error
      }

      logger.info('Bot updated:', { botId, userId })
      return data as unknown as Bot
    } catch (error) {
      logger.error('Update bot error:', error)
      throw new Error('Failed to update bot')
    }
  }

  async deleteBot(botId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', botId)
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      logger.info('Bot deleted:', { botId, userId })
    } catch (error) {
      logger.error('Delete bot error:', error)
      throw new Error('Failed to delete bot')
    }
  }

  async chatWithBot(
    botId: string,
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<{ response: string; conversationId: string }> {
    try {
      // Get bot configuration
      const bot = await this.getBotById(botId, userId)
      if (!bot) {
        throw new Error('Bot not found or access denied')
      }

      // Get or create conversation
      let conversation: BotConversation
      if (conversationId) {
        conversation = await this.getConversation(conversationId, userId)
      } else {
        conversation = await this.createConversation(botId, userId)
      }

      // Prepare context with bot instructions and conversation history
      const systemMessage = `You are ${bot.name}. ${bot.instructions}`
      const conversationHistory = conversation.messages
        .slice(-10) // Last 10 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n')

      const fullPrompt = `${systemMessage}\n\nConversation history:\n${conversationHistory}\n\nuser: ${message}\nassistant:`

      // Generate AI response
      const aiResponse = await generateResponse(
        fullPrompt,
        bot.model,
        userId
      )

      // Save messages to conversation
      await this.addMessageToConversation(conversation.id, 'user', message)
      await this.addMessageToConversation(conversation.id, 'assistant', aiResponse.content)

      logger.info('Bot chat completed:', {
        botId,
        userId,
        conversationId: conversation.id,
        messageLength: message.length,
        responseLength: aiResponse.content.length,
      })

      return {
        response: aiResponse.content,
        conversationId: conversation.id,
      }
    } catch (error) {
      logger.error('Chat with bot error:', error)
      throw new Error('Failed to chat with bot')
    }
  }

  async createConversation(botId: string, userId: string): Promise<BotConversation> {
    try {
      const { data, error } = await supabase
        .from('bot_conversations')
        .insert({
          bot_id: botId,
          user_id: userId,
          messages: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as unknown as BotConversation
    } catch (error) {
      logger.error('Create conversation error:', error)
      throw new Error('Failed to create conversation')
    }
  }

  async getConversation(conversationId: string, userId: string): Promise<BotConversation> {
    try {
      const { data, error } = await supabase
        .from('bot_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

      if (error) {
        throw error
      }

      return data as unknown as BotConversation
    } catch (error) {
      logger.error('Get conversation error:', error)
      throw new Error('Failed to fetch conversation')
    }
  }

  async addMessageToConversation(
    conversationId: string,
    role: BotMessage['role'],
    content: string
  ): Promise<void> {
    try {
      // Get current conversation
      const { data: conversation, error: fetchError } = await supabase
        .from('bot_conversations')
        .select('messages')
        .eq('id', conversationId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      // Add new message
      const newMessage: BotMessage = {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...((conversation.messages as unknown as BotMessage[]) || []), newMessage]

      // Update conversation
      const { error: updateError } = await supabase
        .from('bot_conversations')
        .update({
          messages: updatedMessages as unknown as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)

      if (updateError) {
        throw updateError
      }
    } catch (error) {
      logger.error('Add message to conversation error:', error)
      throw new Error('Failed to add message to conversation')
    }
  }

  async getUserConversations(userId: string, limit = 50): Promise<BotConversation[]> {
    try {
      const { data, error } = await supabase
        .from('bot_conversations')
        .select(`
          *,
          bots (
            id,
            name,
            description
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return data as unknown as BotConversation[] || []
    } catch (error) {
      logger.error('Get user conversations error:', error)
      throw new Error('Failed to fetch user conversations')
    }
  }

  async searchBots(query: string, limit = 20): Promise<Bot[]> {
    try {
      // Generate embedding for the search query
      const queryEmbedding = await generateEmbedding(query)

      // Search using vector similarity (if you have pgvector enabled)
      // For now, we'll use text search
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('is_public', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit)

      if (error) {
        throw error
      }

      return data as unknown as Bot[] || []
    } catch (error) {
      logger.error('Search bots error:', error)
      throw new Error('Failed to search bots')
    }
  }
}

export const botService = new BotService()