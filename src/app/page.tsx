import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Bot, Shield, Zap, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            🚀 Next.js 15 + TypeScript + Supabase
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Production-Ready
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Next.js Boilerplate
            </span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Build scalable web applications with authentication, AI integration, 
            payments, and modern tooling out of the box.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Everything You Need</h2>
            <p className="text-xl text-muted-foreground">
              Built with modern best practices and production-ready features
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Shield className="mb-2 h-8 w-8 text-blue-600" />
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  Secure user management with Supabase Auth, protected routes, and role-based access control.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Bot className="mb-2 h-8 w-8 text-green-600" />
                <CardTitle>AI Integration</CardTitle>
                <CardDescription>
                  Built-in AI chat, custom bot creation, and support for multiple AI providers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="mb-2 h-8 w-8 text-yellow-600" />
                <CardTitle>Payments</CardTitle>
                <CardDescription>
                  Stripe integration with subscription management, webhooks, and billing portal.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="mb-2 h-8 w-8 text-purple-600" />
                <CardTitle>Modern UI</CardTitle>
                <CardDescription>
                  Beautiful components with Tailwind CSS, Shadcn/ui, and dark mode support.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 h-8 w-8 rounded bg-gradient-to-r from-blue-500 to-purple-500" />
                <CardTitle>TypeScript</CardTitle>
                <CardDescription>
                  Full type safety with comprehensive type definitions and validation schemas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 h-8 w-8 rounded bg-gradient-to-r from-green-500 to-blue-500" />
                <CardTitle>Performance</CardTitle>
                <CardDescription>
                  Optimized with Next.js 15 App Router, React Query, and modern performance patterns.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Build?</h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Start building your next application with our production-ready boilerplate.
          </p>
          <Button asChild size="lg">
            <Link href="/register">
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
