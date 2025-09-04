'use client'

import { useAuth } from '@/hooks/use-auth'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { cn } from '@/lib/utils'

interface NavigationProps {
  children: React.ReactNode
  className?: string
}

export function Navigation({ children, className }: NavigationProps) {
  const { user } = useAuth()

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <Header />

      <div className="flex">
        {/* Sidebar - only show for authenticated users */}
        {user && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Sidebar />
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
