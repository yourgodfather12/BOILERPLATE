import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { Providers } from '@/components/providers/providers'
import { Toaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'NextJS 15 Boilerplate',
    template: '%s | NextJS 15 Boilerplate'
  },
  description: 'Production-ready NextJS 15 boilerplate with Auth, AI, and Payments',
  keywords: ['Next.js', 'React', 'TypeScript', 'Supabase', 'Stripe'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourapp.com',
    title: 'NextJS 15 Boilerplate',
    description: 'Production-ready NextJS 15 boilerplate',
    siteName: 'NextJS 15 Boilerplate',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextJS 15 Boilerplate',
    description: 'Production-ready NextJS 15 boilerplate',
    creator: '@yourusername',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        inter.className
      )}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
