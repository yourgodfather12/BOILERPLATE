# 🚀 Complete Full-Stack Setup Guide

## Supabase + Stripe + Hugging Face Transformers

This guide will walk you through setting up the entire boilerplate from scratch with all integrations working.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Supabase Setup](#supabase-setup)
4. [Stripe Setup](#stripe-setup)
5. [Hugging Face Setup](#hugging-face-setup)
6. [Environment Configuration](#environment-configuration)
7. [Database Migrations](#database-migrations)
8. [Running Locally](#running-locally)
9. [Deployment](#deployment)

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Git installed
- Supabase account (https://supabase.com)
- Stripe account (https://stripe.com)
- Hugging Face account (https://huggingface.co)

## Initial Setup

```bash
# Clone the repository
git clone https://github.com/yourgodfather12/BOILERPLATE.git
cd BOILERPLATE

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local
```

## Supabase Setup

### 1. Create a Supabase Project

- Go to https://app.supabase.com
- Click "New Project"
- Fill in project details:
  - **Name**: Your project name
  - **Database Password**: Strong password (save this!)
  - **Region**: Choose closest to your location

### 2. Get Your API Keys

- In Project Settings → API Keys, copy:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 3. Database Schema

Execute these SQL migrations in Supabase SQL Editor:

```sql
-- Users table (extended)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  billing_email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'inactive',
  plan_type TEXT, -- 'free', 'pro', 'enterprise'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL, -- 'ai_chat', 'api_calls', etc.
  count INTEGER DEFAULT 0,
  month DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations table for AI chat
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  model TEXT DEFAULT 'mistralai/Mistral-7B-Instruct-v0.1',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant'
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Billing events table
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  amount DECIMAL(10, 2),
  stripe_event_id TEXT UNIQUE,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_usage_user_id ON usage(user_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_billing_events_user_id ON billing_events(user_id);
```

## Stripe Setup

### 1. Create Stripe Account

- Go to https://dashboard.stripe.com
- Complete account verification

### 2. Create Products and Prices

In the Stripe Dashboard, go to **Products** and create:

#### Product 1: Pro Plan
- **Name**: Pro
- **Recurring**: Monthly
- **Price**: $29/month
- Save the **Price ID** (starts with `price_`)

#### Product 2: Enterprise Plan
- **Name**: Enterprise
- **Recurring**: Monthly  
- **Price**: $99/month
- Save the **Price ID**

### 3. Get API Keys

- Go to Settings → API Keys
- Copy:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_...)
  - `STRIPE_SECRET_KEY` (sk_test_...)

### 4. Create Webhook

- Go to Developers → Webhooks
- Click "Add endpoint"
- **URL**: `https://yourdomain.com/api/webhooks/stripe`
- **Events**: Select `customer.subscription.created`, `customer.subscription.deleted`, `charge.failed`, `charge.succeeded`
- Copy the **Signing Secret** → `STRIPE_WEBHOOK_SECRET`

## Hugging Face Setup

### 1. Create Account

- Go to https://huggingface.co/join
- Complete registration

### 2. Create API Token

- Go to Settings → Access Tokens
- Click "New token"
- **Name**: Boilerplate API
- **Type**: Read
- Copy the token → `HUGGINGFACE_API_KEY`

### 3. Choose Your Model

Popular free models:
- `mistralai/Mistral-7B-Instruct-v0.1` (Recommended, fast, accurate)
- `meta-llama/Llama-2-7b-chat-hf`
- `tiiuae/falcon-7b-instruct`
- `google/flan-t5-base`

## Environment Configuration

Edit `.env.local` with all your values:

```bash
# Core
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID=price_...

# Hugging Face
HUGGINGFACE_API_KEY=hf_...
NEXT_PUBLIC_HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1
```

## Database Migrations

```bash
# If using local Supabase:
supabase start
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.ts
```

## Running Locally

```bash
# Start development server
pnpm dev

# In another terminal, test the Stripe webhook locally
pnpm stripe:listen  # if you have stripe CLI
```

Visit http://localhost:3000

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variables
5. Click Deploy

### Configure Custom Domain

1. In Vercel, go to Settings → Domains
2. Add your custom domain
3. Update Stripe webhook URL to production domain

## API Endpoints

Key endpoints created:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/user` - Current user
- `POST /api/stripe/create-portal` - Billing portal
- `POST /api/stripe/create-checkout` - Checkout session
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/conversations` - Get user conversations
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Troubleshooting

### "Module not found" errors
```bash
pnpm install
```

### Supabase connection issues
- Check `.env.local` has correct URL and keys
- Verify IP whitelist in Supabase Settings

### Stripe webhook not working
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check webhook signing secret is correct

### Hugging Face API rate limited
- Free tier has limits, consider Hugging Face Inference API Pro
- Use proper error handling and retry logic

## Next Steps

1. ✅ Customize branding and UI
2. ✅ Add more AI models
3. ✅ Implement usage limits
4. ✅ Add email notifications
5. ✅ Set up analytics
6. ✅ Configure CI/CD pipeline

## Support

For issues or questions:
- Check the main README.md
- Review API documentation in `/docs`
- Check GitHub issues

---

Happy building! 🎉
