import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'
import {
  MessageSquare,
  Bot,
  TrendingUp,
  Users,
  ArrowRight,
  Plus,
  Zap,
  BarChart3
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    {
      title: 'AI Conversations',
      value: '24',
      description: 'This month',
      icon: MessageSquare,
      trend: '+12%',
    },
    {
      title: 'Active Bots',
      value: '3',
      description: 'Custom assistants',
      icon: Bot,
      trend: '+1',
    },
    {
      title: 'Usage',
      value: '1.2k',
      description: 'API calls today',
      icon: Zap,
      trend: '+8%',
    },
    {
      title: 'Success Rate',
      value: '98%',
      description: 'Response accuracy',
      icon: TrendingUp,
      trend: '+2%',
    },
  ]

  const recentActivity = [
    {
      type: 'conversation',
      title: 'Chat with Code Assistant',
      time: '2 minutes ago',
      status: 'completed',
    },
    {
      type: 'bot',
      title: 'Created Customer Support Bot',
      time: '1 hour ago',
      status: 'active',
    },
    {
      type: 'conversation',
      title: 'Generated marketing copy',
      time: '3 hours ago',
      status: 'completed',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.user_metadata?.name || 'User'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your AI assistants today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
                <span className="text-green-600 ml-1">{stat.trend}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Start using AI features right away
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/ai">
                <MessageSquare className="mr-2 h-4 w-4" />
                Start AI Chat
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard">
                <Plus className="mr-2 h-4 w-4" />
                Create New Bot
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest AI interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'conversation' ? (
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Bot className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>New Features</CardTitle>
            <CardDescription>
              Discover what's new in AI Boilerplate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Custom Bot Builder</h4>
              <p className="text-xs text-muted-foreground">
                Create personalized AI assistants with custom instructions and knowledge.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Advanced Analytics</h4>
              <p className="text-xs text-muted-foreground">
                Track usage, performance, and optimize your AI workflows.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/about">
                Learn More
                <ArrowRight className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}