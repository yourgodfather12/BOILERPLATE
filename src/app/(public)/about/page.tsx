import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Bot,
  Shield,
  Zap,
  Users,
  Code,
  Heart,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Assistants',
      description: 'Create custom AI bots with advanced conversational capabilities and domain-specific knowledge.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with end-to-end encryption, GDPR compliance, and advanced access controls.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with Next.js 15 and optimized for performance with edge computing and modern caching.'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly with shared bots, conversation history, and team management features.'
    },
  ]

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Co-founder',
      bio: 'Former AI researcher at Google Brain with 10+ years in machine learning.',
      avatar: 'SC'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO & Co-founder',
      bio: 'Full-stack developer and DevOps expert with experience at Netflix and Airbnb.',
      avatar: 'MR'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Head of AI',
      bio: 'PhD in Computer Science, specializing in natural language processing and conversational AI.',
      avatar: 'EW'
    },
  ]

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '500K+', label: 'AI Conversations' },
    { value: '99.9%', label: 'Uptime' },
    { value: '50+', label: 'Countries' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            About AI Boilerplate
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Building the Future of
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}AI-Powered Applications
            </span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to democratize AI by making it easy for developers and businesses
            to build, deploy, and manage intelligent conversational assistants.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-12 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold">Our Mission</h2>
          <p className="text-xl text-muted-foreground mb-8">
            We believe AI should be accessible to everyone. Our platform empowers developers,
            businesses, and individuals to harness the power of artificial intelligence without
            the complexity of building everything from scratch.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Code className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <CardTitle>For Developers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Simple APIs and comprehensive documentation to integrate AI into your applications.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-green-600 mx-auto mb-4" />
                <CardTitle>For Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Collaborate on AI projects with shared workspaces and team management tools.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-4" />
                <CardTitle>For Everyone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  User-friendly interface to create and manage AI assistants without technical expertise.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold">Why Choose Us</h2>
            <p className="text-xl text-muted-foreground">
              Built with modern technology and best practices
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
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

      {/* Team */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground">
              Experts in AI, engineering, and product development
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index}>
                <CardHeader className="text-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">{member.avatar}</span>
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{member.bio}</p>
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
            Join thousands of users who are already building amazing AI applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Start Building Today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
