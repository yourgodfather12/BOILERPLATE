import Stripe from 'stripe'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { createServerSupabaseClientAnon, createServerSupabaseClientAdmin } from '@/lib/supabase'

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: 'month' | 'year'
  features: string[]
  stripePriceId: string
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    interval: 'month',
    features: [
      '10 AI conversations per month',
      '1 custom bot',
      'Basic support',
      'Community access'
    ],
    stripePriceId: '',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For power users and professionals',
    price: 19,
    interval: 'month',
    features: [
      'Unlimited AI conversations',
      'Unlimited custom bots',
      'Priority support',
      'Advanced AI models',
      'Bot sharing and marketplace',
      'Analytics dashboard'
    ],
    stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams and organizations',
    price: 99,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom integrations',
      'SSO authentication',
      'Dedicated support',
      'Custom AI training'
    ],
    stripePriceId: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!,
  },
]

export class StripeService {
  async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      const supabase = await createServerSupabaseClientAnon()

      // Get user data
      const { data: user, error } = await supabase
        .from('users')
        .select('email, stripe_customer_id')
        .eq('id', userId)
        .single()

      if (error || !user) {
        throw new Error('User not found')
      }

      let customerId = user.stripe_customer_id

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId,
          },
        })

        customerId = customer.id

        // Update user with Stripe customer ID
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId)
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      })

      logger.info('Checkout session created:', {
        sessionId: session.id,
        userId,
        priceId,
      })

      return session
    } catch (error) {
      logger.error('Create checkout session error:', error)
      throw new Error('Failed to create checkout session')
    }
  }

  async createPortalSession(userId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
    try {
      const supabase = await createServerSupabaseClientAnon()

      // Get user's Stripe customer ID
      const { data: user, error } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()

      if (error || !user?.stripe_customer_id) {
        throw new Error('No Stripe customer found')
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: returnUrl,
      })

      logger.info('Portal session created:', {
        sessionId: session.id,
        userId,
      })

      return session
    } catch (error) {
      logger.error('Create portal session error:', error)
      throw new Error('Failed to create portal session')
    }
  }

  async handleWebhookEvent(body: string, signature: string): Promise<void> {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      )

      logger.info('Stripe webhook received:', { type: event.type, id: event.id })

      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break

        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice)
          break

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice)
          break

        default:
          logger.info('Unhandled webhook event type:', event.type)
      }
    } catch (error) {
      logger.error('Webhook handling error:', error)
      throw error
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    try {
      const supabase = await createServerSupabaseClientAdmin()

      const customerId = subscription.customer as string
      const priceId = subscription.items.data[0].price.id

      // Find plan by price ID
      const plan = subscriptionPlans.find(p => p.stripePriceId === priceId)
      if (!plan) {
        logger.warn('Unknown price ID in subscription:', priceId)
        return
      }

      // Get user by customer ID
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (error || !user) {
        logger.error('User not found for customer:', customerId)
        return
      }

      // Create subscription record
      await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          status: subscription.status,
          plan_id: plan.id,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      logger.info('Subscription created:', {
        userId: user.id,
        subscriptionId: subscription.id,
        planId: plan.id,
      })
    } catch (error) {
      logger.error('Handle subscription created error:', error)
      throw error
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    try {
      const supabase = await createServerSupabaseClientAdmin()

      const priceId = subscription.items.data[0].price.id
      const plan = subscriptionPlans.find(p => p.stripePriceId === priceId)

      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          plan_id: plan?.id || 'unknown',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)

      logger.info('Subscription updated:', {
        subscriptionId: subscription.id,
        status: subscription.status,
      })
    } catch (error) {
      logger.error('Handle subscription updated error:', error)
      throw error
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      const supabase = await createServerSupabaseClientAdmin()

      await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)

      logger.info('Subscription canceled:', {
        subscriptionId: subscription.id,
      })
    } catch (error) {
      logger.error('Handle subscription deleted error:', error)
      throw error
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    try {
      const supabase = await createServerSupabaseClientAdmin()

      const subscriptionId = invoice.subscription as string

      if (subscriptionId) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId)

        logger.info('Payment succeeded for subscription:', subscriptionId)
      }
    } catch (error) {
      logger.error('Handle payment succeeded error:', error)
      throw error
    }
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      const supabase = await createServerSupabaseClientAdmin()

      const subscriptionId = invoice.subscription as string

      if (subscriptionId) {
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId)

        logger.info('Payment failed for subscription:', subscriptionId)
      }
    } catch (error) {
      logger.error('Handle payment failed error:', error)
      throw error
    }
  }
}

export const stripeService = new StripeService()