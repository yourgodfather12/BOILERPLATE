import { Navigation } from '@/components/layout/navigation'
import { Footer } from '@/components/layout/footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Navigation>
      {children}
      <Footer />
    </Navigation>
  )
}
