import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'

// Mock the auth form component
jest.mock('@/components/forms/auth-form', () => ({
  AuthForm: ({ mode }: { mode: string }) => (
    <div data-testid="auth-form" data-mode={mode}>
      Auth Form Component
    </div>
  ),
}))

describe('LoginPage', () => {
  it('renders the login page correctly', () => {
    render(<LoginPage />)

    expect(screen.getByTestId('auth-form')).toBeInTheDocument()
    expect(screen.getByTestId('auth-form')).toHaveAttribute('data-mode', 'login')
  })

  it('displays the correct page structure', () => {
    render(<LoginPage />)

    // Check if the container has the correct classes
    const container = screen.getByTestId('auth-form').parentElement
    expect(container).toHaveClass('container')
    expect(container).toHaveClass('flex')
    expect(container).toHaveClass('h-screen')
    expect(container).toHaveClass('w-screen')
    expect(container).toHaveClass('flex-col')
    expect(container).toHaveClass('items-center')
    expect(container).toHaveClass('justify-center')
  })
})
