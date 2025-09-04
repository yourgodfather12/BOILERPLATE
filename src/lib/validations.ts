import { z } from 'zod'

export const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = authSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
})

export const aiChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
})

export const botSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  instructions: z.string().min(20, 'Instructions must be at least 20 characters').max(2000, 'Instructions too long'),
  model: z.enum(['gpt-3.5-turbo', 'gpt-4', 'claude-3-haiku', 'claude-3-sonnet']),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(100).max(4000),
  is_public: z.boolean().default(false),
})

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
})

export type AuthFormData = z.infer<typeof authSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type AIChatFormData = z.infer<typeof aiChatSchema>
export type BotFormData = z.infer<typeof botSchema>
export type ContactFormData = z.infer<typeof contactSchema>
