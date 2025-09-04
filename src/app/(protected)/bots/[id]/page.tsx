'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { botService, type Bot } from '@/services/bots'
import {
  ArrowLeft,
  Bot as BotIcon,
  MessageSquare,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Users,
  Zap,
  Thermometer,
  FileText,
  Edit,
  Play
} from 'lucide-react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function BotDetailPage() {
  const [bot, setBot] = useState<Bot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadBot(id)
    }
  }, [id])

  const loadBot = async (botId: string) => {
    try {
      const botData = await botService.getBotById(botId, user?.id)
      if (!botData) {
        toast({
          title: 'Error',
          description: 'Bot not found or access denied.',
          variant: 'destructive',
        })
        router.push('/bots')
        return
      }
      setBot(botData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bot details. Please try again.',
        variant: 'destructive',
      })
      router.push('/bots')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBot = async () => {
    if (!bot || !user) return

    try {
      await botService.deleteBot(bot.id, user.id)
      toast({
        title: 'Success',
        description: 'Bot deleted successfully.',
      })
      router.push('/bots')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete bot. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const toggleBotVisibility = async () => {
    if (!bot || !user) return

    try {
      await botService.updateBot(bot.id, user.id, { is_public: !bot.is_public })
      setBot(prev => prev ? { ...prev, is_public: !prev.is_public } : null)
      toast({
        title: 'Success',
        description: `Bot is now ${!bot.is_public ? 'public' : 'private'}.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update bot visibility. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading bot details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <BotIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Bot not found</h3>
          <p className="text-muted-foreground mb-6">
            The bot you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link href="/bots">Back to My Bots</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === bot.user_id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/bots">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{bot.name}</h1>
              <p className="text-muted-foreground mt-2">{bot.description}</p>
            </div>
          </div>

          {isOwner && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href={`/bots/${bot.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" onClick={toggleBotVisibility}>
                {bot.is_public ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Make Private
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Make Public
                  </>
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/bots/${bot.id}/chat`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </Link>
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Bot Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        <BotIcon className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{bot.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={bot.is_public ? 'default' : 'secondary'}>
                          {bot.is_public ? 'Public' : 'Private'}
                        </Badge>
                        <Badge variant="outline">{bot.model}</Badge>
                      </div>
                    </div>
                  </div>
                  <Button asChild>
                    <Link href={`/bots/${bot.id}/chat`}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Chat
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{bot.description}</p>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Bot Instructions
                </CardTitle>
                <CardDescription>
                  The system prompt that defines this bot's behavior and personality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {bot.instructions}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Recent Conversations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Recent Conversations
                </CardTitle>
                <CardDescription>
                  Latest interactions with this bot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <Link href={`/bots/${bot.id}/chat`}>
                      Start First Conversation
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Model</span>
                  </div>
                  <Badge variant="outline">{bot.model}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Temperature</span>
                  </div>
                  <span className="text-sm font-medium">{bot.temperature}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Max Tokens</span>
                  </div>
                  <span className="text-sm font-medium">{bot.max_tokens}</span>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Conversations</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Messages Sent</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-medium">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Response Time</span>
                  <span className="font-medium">--</span>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created {new Date(bot.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Updated {new Date(bot.updated_at).toLocaleDateString()}</span>
                </div>
                {bot.is_public && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Public bot</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Bot</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{bot.name}"? This action cannot be undone and will permanently remove the bot and all its conversation history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteBot} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Bot
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
