import { ContactForm } from '@/components/forms/contact-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Users,
  Zap,
  Shield
} from 'lucide-react'

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Get in touch via email',
      value: 'hello@ai-boilerplate.com',
      href: 'mailto:hello@ai-boilerplate.com'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak with our team',
      value: '+1 (555) 123-4567',
      href: 'tel:+15551234567'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Our headquarters',
      value: '123 AI Street, Tech City, TC 12345',
      href: '#'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      description: 'When we are available',
      value: 'Mon-Fri 9AM-6PM PST',
      href: '#'
    }
  ]

  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our AI assistant',
      available: true
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join our developer community',
      available: true
    },
    {
      icon: Zap,
      title: 'Quick Start',
      description: 'Get up and running in minutes',
      available: true
    },
    {
      icon: Shield,
      title: 'Enterprise Support',
      description: 'Dedicated support for large teams',
      available: false
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Get in Touch with
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Our Team
            </span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Have questions about AI Boilerplate? Need help getting started?
            We're here to help you succeed.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & Support */}
          <div className="space-y-8">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Multiple ways to reach our team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <info.icon className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">{info.title}</h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          {info.description}
                        </p>
                        <a
                          href={info.href}
                          className="text-sm text-primary hover:underline"
                        >
                          {info.value}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Support Options */}
            <Card>
              <CardHeader>
                <CardTitle>Support Options</CardTitle>
                <CardDescription>
                  Choose the best way to get help
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {supportOptions.map((option, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <option.icon className={`h-5 w-5 ${option.available ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <h3 className="font-medium">{option.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      {option.available ? (
                        <Button variant="outline" size="sm">
                          Start
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardHeader>
                <CardTitle>Response Times</CardTitle>
                <CardDescription>
                  How quickly you can expect a response
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">General inquiries</span>
                    <span className="text-sm font-medium">Within 24 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Technical support</span>
                    <span className="text-sm font-medium">Within 4 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Enterprise support</span>
                    <span className="text-sm font-medium">Within 1 hour</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Critical issues</span>
                    <span className="text-sm font-medium">Immediate</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}