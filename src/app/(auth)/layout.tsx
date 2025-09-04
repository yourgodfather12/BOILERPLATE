import { Navigation } from '@/components/layout/navigation'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Navigation>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </Navigation>
  )
}
