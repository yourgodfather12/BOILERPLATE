'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import {
  Check,
  Star,
  Zap,
  Crown,
  Users,
  MessageSquare,
  Bot,
  BarChart3,
  Shield,
  HeadphonesIcon
} from 'lucide-react'

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      price: { monthly: 0, yearly: 0 },
      icon: Star,
      features: [
        '10 AI conversations per month',
        '1 custom bot',
        'Basic AI models',
        'Community support',
        'Basic analytics'
      ],
      limitations: [
        'Limited to basic models',
        'Community support only',
        'No team features'
      ],
      popular: false,
      cta: 'Get Started',
      href: '/register'
    },
    {
      name: 'Pro',
      description: 'For power users and professionals',
      price: { monthly: 19, yearly: 190 },
      icon: Zap,
      features: [
        'Unlimited AI conversations',
        'Up to 10 custom bots',
        'Advanced AI models (GPT-4, Claude)',
        'Priority email support',
        'Advanced analytics',
        'API access',
        'Custom bot training'
      ],
      limitations: [
        'Limited team members',
        'No custom integrations'
      ],
      popular: true,
      cta: 'Start Pro Trial',
      href: '/register'
    },
    {
      name: 'Enterprise',
      description: 'For teams and organizations',
      price: { monthly: 99, yearly: 990 },
      icon: Crown,
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'Custom AI model training',
        'SSO & advanced security',
        'Dedicated support manager',
        'Custom integrations',
        'White-label solution',
        'SLA guarantee'
      ],
      limitations: [],
      popular: false,
      cta: 'Contact Sales',
      href: '/contact'
    }
  ]

  const faqs = [
    {
      question: 'Can I change plans at any time?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
    },
    {
      question: 'What AI models are included?',
      answer: 'Free plan includes basic models. Pro includes GPT-4 and Claude. Enterprise includes custom model training.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a 14-day free trial for Pro and Enterprise plans with full access to all features.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee for all paid plans if you\'re not satisfied.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.'
    }
  ]

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Conversations',
      description: 'Unlimited AI chat with advanced models and conversation history'
    },
    {
      icon: Bot,
      title: 'Custom Bots',
      description: 'Create and deploy custom AI assistants tailored to your needs'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Detailed insights and performance metrics for your AI usage'
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Enterprise-grade security with data encryption and compliance'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with shared bots and team management features'
    },
    {
      icon: HeadphonesIcon,
      title: 'Support',
      description: 'Get help from our expert support team whenever you need it'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Choose the Perfect Plan for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Your AI Journey
            </span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Start free and scale as you grow. All plans include our core AI features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Label htmlFor="billing-toggle" className="text-sm font-medium">
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label htmlFor="billing-toggle" className="text-sm font-medium">
              Yearly
              <Badge variant="secondary" className="ml-2">
                Save 17%
              </Badge>
            </Label>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <plan.icon className={`h-8 w-8 mx-auto mb-4 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>

                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && (
                      <span className="text-muted-foreground">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={plan.href}>
                      {plan.cta}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold">Everything You Need</h2>
            <p className="text-xl text-muted-foreground">
              Powerful features to build amazing AI applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mb-8 text-xl opacity-90">
            Join thousands of users building amazing AI applications today.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">
              Start Your Free Trial
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
