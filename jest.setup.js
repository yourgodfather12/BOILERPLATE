import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: '',
    asPath: '/',
  }),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Global test utilities
global.testServer = () => {
  // Mock server setup for API tests
}

// Set up test environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock'
process.env.STRIPE_PRO_MONTHLY_PRICE_ID = 'price_pro_mock'
process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID = 'price_enterprise_mock'
process.env.HUGGINGFACE_API_KEY = 'hf_mock_key'
process.env.OPENAI_API_KEY = 'sk-mock-key'
process.env.RESEND_API_KEY = 're_mock_key'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock Next.js Request/Response APIs for testing
global.Request = jest.fn()
global.Response = jest.fn()
global.Headers = jest.fn().mockImplementation((init) => ({
  get: jest.fn((key) => init?.[key]),
  set: jest.fn(),
  append: jest.fn(),
  has: jest.fn(),
  delete: jest.fn(),
}))

// Mock cookies for Next.js
global.cookies = jest.fn().mockReturnValue({
  get: jest.fn(),
  getAll: jest.fn().mockReturnValue([]),
  set: jest.fn(),
  setAll: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn()
})

// Mock fetch for Stripe and other HTTP calls
global.fetch = jest.fn()

// Mock Next.js headers function
jest.mock('next/headers', () => ({
  headers: jest.fn().mockReturnValue({
    get: jest.fn(),
    set: jest.fn(),
    append: jest.fn(),
    has: jest.fn(),
    delete: jest.fn(),
  })
}))

// Mock Next.js specific classes
global.NextRequest = jest.fn().mockImplementation((url, init) => ({
  url,
  method: init?.method || 'GET',
  headers: new global.Headers(init?.headers),
  json: jest.fn().mockResolvedValue(init?.body ? JSON.parse(init.body) : {}),
  text: jest.fn().mockResolvedValue(init?.body || ''),
  ip: '127.0.0.1',
  cookies: global.cookies(),
  ...init
}))

global.NextResponse = {
  json: jest.fn().mockImplementation((data, options) => ({
    status: options?.status || 200,
    json: jest.fn().mockResolvedValue(data),
    headers: new Map()
  }))
}