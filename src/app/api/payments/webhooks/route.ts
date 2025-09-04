import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { logger } from '@/lib/logger'
import { stripeService } from '@/services/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      logger.error('Stripe webhook signature missing')
      return NextResponse.json({ error: 'Webhook signature required' }, { status: 400 })
    }

    // Handle the webhook
    await stripeService.handleWebhookEvent(body, signature)

    return NextResponse.json({ received: true })

  } catch (error) {
    logger.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Webhooks should use POST method only
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}