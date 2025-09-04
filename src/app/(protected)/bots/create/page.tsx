'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { botSchema, type BotFormData } from '@/lib/validations'
import { botService } from '@/services/bots'
import { ArrowLeft, Bot, Save, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function CreateBotPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const form = useForm<BotFormData>({
    resolver: zodResolver(botSchema),
    defaultValues: {
      name: '',
      description: '',
      instructions: '',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 1000,
      is_public: false,
    },
  })

  const onSubmit = async (data: BotFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a bot.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const bot = await botService.createBot(user.id, data)

      toast({
        title: 'Success',
        description: 'Bot created successfully!',
      })

      router.push(`/bots/${bot.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create bot. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exampleInstructions = [
    {
      name: 'Customer Support',
      instructions: 'You are a helpful customer support assistant for our company. Be polite, professional, and provide clear solutions to customer inquiries. Always try to resolve issues efficiently and escalate to human agents when necessary.'
    },
    {
      name: 'Code Reviewer',
      instructions: 'You are an experienced software developer conducting code reviews. Focus on best practices, security vulnerabilities, performance optimizations, and code readability. Provide constructive feedback with specific examples.'
    },
    {
      name: 'Content Writer',
      instructions: 'You are a professional content writer. Create engaging, well-structured content that is optimized for readability and SEO. Use clear headings, concise paragraphs, and compelling language.'
    },
    {
      name: 'Data Analyst',
      instructions: 'You are a data analysis expert. Help users understand their data, identify trends, create visualizations, and provide actionable insights. Explain complex concepts in simple terms.'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create New Bot</h1>
              <p className="text-muted-foreground mt-2">
                Build a custom AI assistant tailored to your needs
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Form */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 h-5 w-5" />
                Bot Configuration
              </CardTitle>
              <CardDescription>
                Configure your bot's personality, capabilities, and behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bot Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="My Awesome Bot"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description of what your bot does..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_public"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Make Bot Public
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Allow other users to discover and use your bot
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* AI Configuration */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">AI Configuration</h3>

                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>AI Model</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an AI model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast & Affordable)</SelectItem>
                              <SelectItem value="gpt-4">GPT-4 (Most Capable)</SelectItem>
                              <SelectItem value="claude-3-haiku">Claude 3 Haiku (Fast & Intelligent)</SelectItem>
                              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet (Balanced Performance)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperature: {field.value}</FormLabel>
                            <FormControl>
                              <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                className="w-full"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              Controls randomness (0 = focused, 2 = creative)
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="max_tokens"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Tokens</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="100"
                                max="4000"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              Maximum response length
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Bot Instructions</h3>
                    <p className="text-sm text-muted-foreground">
                      Define your bot's personality, knowledge, and behavior. Be specific about how it should respond.
                    </p>

                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="You are a helpful assistant that..."
                              className="min-h-[120px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" asChild>
                      <Link href="/dashboard">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Create Bot
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Example Instructions</CardTitle>
                <CardDescription>
                  Get started with these templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exampleInstructions.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left h-auto p-3 justify-start"
                      onClick={() => {
                        form.setValue('name', example.name)
                        form.setValue('instructions', example.instructions)
                      }}
                    >
                      <div>
                        <div className="font-medium">{example.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {example.instructions.substring(0, 60)}...
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips for Better Bots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p className="font-medium">🎯 Be Specific</p>
                  <p className="text-muted-foreground text-xs">
                    Clearly define your bot's role and expertise areas.
                  </p>
                </div>
                <div className="text-sm space-y-2">
                  <p className="font-medium">📝 Provide Context</p>
                  <p className="text-muted-foreground text-xs">
                    Include relevant background information and examples.
                  </p>
                </div>
                <div className="text-sm space-y-2">
                  <p className="font-medium">🎨 Define Personality</p>
                  <p className="text-muted-foreground text-xs">
                    Specify tone, communication style, and response format.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
