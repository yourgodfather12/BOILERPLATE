// Common API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// AI API types
export interface AIChatRequest {
  message: string
  model?: string
  conversationId?: string
}

export interface AIChatResponse {
  message: string
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  conversationId?: string
}

export interface AIConversation {
  id: string
  user_id: string
  prompt: string
  response: string
  model: string
  created_at: string
}

// Bot API types
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

export interface CreateBotRequest {
  name: string
  description: string
  instructions: string
  model: string
  temperature?: number
  max_tokens?: number
  is_public?: boolean
}

export interface UpdateBotRequest extends Partial<CreateBotRequest> {
  id: string
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

export interface BotChatRequest {
  message: string
  botId: string
  conversationId?: string
}

export interface BotChatResponse {
  response: string
  conversationId: string
}

// Payment API types
export interface PaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  stripePriceId: string
}

export interface CreateCheckoutSessionRequest {
  priceId: string
  successUrl: string
  cancelUrl: string
}

export interface CheckoutSession {
  id: string
  url: string
}

export interface CreatePortalSessionRequest {
  returnUrl: string
}

export interface PortalSession {
  url: string
}

// Health check API types
export interface HealthStatus {
  status: 'ok' | 'error'
  timestamp: string
  services: {
    database: 'ok' | 'error'
    redis?: 'ok' | 'error'
    external?: 'ok' | 'error'
  }
  version: string
  uptime: number
}

// User API types
export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UpdateProfileRequest {
  name?: string
  avatar_url?: string
}

// Error types
export interface ApiError {
  code: string
  message: string
  details?: any
}

// Webhook types
export interface StripeWebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}

// Search types
export interface SearchRequest {
  query: string
  type?: 'bots' | 'conversations' | 'all'
  limit?: number
  offset?: number
}

export interface SearchResult {
  id: string
  type: 'bot' | 'conversation'
  title: string
  description: string
  created_at: string
  relevance_score: number
}

// Analytics types
export interface AnalyticsData {
  totalUsers: number
  totalConversations: number
  totalBots: number
  activeSubscriptions: number
  revenue: {
    monthly: number
    yearly: number
    total: number
  }
  usage: {
    aiRequests: number
    botInteractions: number
    averageSessionDuration: number
  }
}

// File upload types
export interface FileUploadRequest {
  file: File
  type: 'avatar' | 'document'
}

export interface FileUploadResponse {
  url: string
  filename: string
  size: number
  type: string
}
