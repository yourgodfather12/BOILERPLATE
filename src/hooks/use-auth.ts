import { useContext } from 'react'
import { AuthContext } from '@/components/providers/auth-provider'

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    // During SSR or if AuthProvider is not mounted, return a default context
    return {
      user: null,
      loading: true,
      signOut: async () => {
        // No-op during SSR
      },
    }
  }

  return context
}
