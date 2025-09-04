# 🚀 AI Boilerplate

A production-ready Next.js 15 boilerplate with authentication, AI integration, and payment processing. Built with modern technologies and best practices for scalable web applications.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green)
![Stripe](https://img.shields.io/badge/Stripe-Payments-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## ✨ Features

- **🔐 Authentication**: Secure user authentication with Supabase
- **🤖 AI Integration**: Multi-provider AI support (OpenAI, Hugging Face)
- **💳 Payment Processing**: Stripe integration with subscription management
- **🎨 Modern UI**: Beautiful components with Tailwind CSS and shadcn/ui
- **📱 Responsive Design**: Mobile-first approach with dark mode support
- **🔒 Security**: Enterprise-grade security with CSRF protection
- **📊 Analytics**: Built-in analytics and monitoring
- **🧪 Testing**: Comprehensive test suite with Jest and React Testing Library
- **🚀 Performance**: Optimized with Next.js 15 App Router

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **AI**: OpenAI GPT, Hugging Face
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- Supabase account
- Stripe account (for payments)
- AI service API keys (OpenAI or Hugging Face)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-boilerplate.git
   cd ai-boilerplate
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your actual configuration:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # AI Services
   OPENAI_API_KEY=your_openai_api_key
   # or
   HUGGINGFACE_API_KEY=your_huggingface_api_key
   ```

4. **Database Setup**
   ```bash
   # Start Supabase locally (optional)
   supabase start

   # Generate TypeScript types
   supabase gen types typescript --local > src/types/database.ts

   # Run database migrations
   supabase db push
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
ai-boilerplate/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (protected)/       # Protected routes
│   │   ├── (public)/          # Public routes
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   ├── forms/            # Form components
│   │   └── providers/        # Context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   ├── services/             # External service integrations
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── scripts/                  # Setup and utility scripts
├── tests/                    # Test files
└── docs/                     # Documentation
```

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run test suite
- `pnpm test:watch` - Run tests in watch mode
- `pnpm db:generate` - Generate TypeScript types from Supabase
- `pnpm db:migrate` - Run database migrations
- `pnpm setup` - Run initial setup script

## 🔐 Authentication

The boilerplate includes a complete authentication system:

- **Sign up/Sign in**: Email and password authentication
- **OAuth**: Support for GitHub and Google OAuth
- **Password Reset**: Secure password reset flow
- **Protected Routes**: Automatic route protection
- **User Profiles**: User profile management

## 🤖 AI Integration

Built-in AI capabilities with multiple providers:

- **Chat Interface**: Real-time AI conversations
- **Custom Bots**: Create and manage AI assistants
- **Multi-Provider**: OpenAI GPT and Hugging Face support
- **Conversation History**: Persistent chat history
- **Streaming**: Real-time response streaming

## 💳 Payment Integration

Complete payment processing with Stripe:

- **Subscriptions**: Recurring subscription management
- **One-time Payments**: Single purchase support
- **Billing Portal**: Customer self-service
- **Webhooks**: Automated payment processing
- **Usage Tracking**: Monitor API usage and costs

## 🧪 Testing

Comprehensive test suite included:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test -- --coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import your repository to Vercel
   - Configure environment variables

2. **Database Setup**
   - Create Supabase project
   - Update environment variables
   - Run migrations

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Other Platforms

The boilerplate is compatible with any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 📚 Documentation

- [API Reference](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guide](./docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Stripe](https://stripe.com/) - Payment processing
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

## 🆘 Support

- 📧 Email: hello@ai-boilerplate.com
- 💬 Discord: [Join our community](https://discord.gg/ai-boilerplate)
- 📖 Docs: [Documentation](https://docs.ai-boilerplate.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/ai-boilerplate/issues)

---

Built with ❤️ for developers who want to build amazing AI-powered applications.
