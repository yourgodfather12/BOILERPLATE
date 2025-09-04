import { Navigation } from '@/components/layout/navigation'
import { Footer } from '@/components/layout/footer'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Navigation>
      <div className="min-h-[calc(100vh-4rem)]">
        {children}
      </div>
      <Footer />
    </Navigation>
  )
}
