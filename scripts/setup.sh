#!/bin/bash

# AI Boilerplate Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up AI Boilerplate..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.0.0"

if ! [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is not supported. Please use Node.js 18+."
    exit 1
fi

echo "✅ Node.js $NODE_VERSION detected"

# Check if pnpm is available
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
    INSTALL_CMD="pnpm install"
    RUN_CMD="pnpm"
elif command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
    INSTALL_CMD="yarn install"
    RUN_CMD="yarn"
else
    PACKAGE_MANAGER="npm"
    INSTALL_CMD="npm install"
    RUN_CMD="npm run"
fi

echo "📦 Using $PACKAGE_MANAGER as package manager"

# Install dependencies
echo "📦 Installing dependencies..."
$INSTALL_CMD

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📋 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual configuration values"
else
    echo "✅ .env.local already exists"
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI is not installed. Install it from https://supabase.com/docs/guides/cli"
else
    echo "✅ Supabase CLI detected"

    # Check if user wants to set up Supabase locally
    read -p "🤔 Do you want to start Supabase locally? (y/n): " setup_supabase
    if [[ $setup_supabase =~ ^[Yy]$ ]]; then
        echo "🔧 Starting Supabase..."
        supabase start

        # Generate types
        echo "📝 Generating TypeScript types..."
        supabase gen types typescript --local > src/types/database.ts
    fi
fi

# Build the application
echo "🔨 Building the application..."
$RUN_CMD build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Update .env.local with your actual configuration values"
echo "2. Set up your Supabase project and update the URLs"
echo "3. Configure your AI service API keys"
echo "4. Set up Stripe for payments (if using)"
echo "5. Run '$RUN_CMD dev' to start the development server"
echo ""
echo "📖 Documentation: Check the README.md for detailed setup instructions"
echo "🆘 Need help? Visit our GitHub repository or contact support"