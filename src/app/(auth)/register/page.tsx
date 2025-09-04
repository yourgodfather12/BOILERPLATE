import { AuthForm } from '@/components/forms/auth-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a new account to get started with AI Boilerplate.',
}

export default function RegisterPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <AuthForm mode="register" />
    </div>
  )
}