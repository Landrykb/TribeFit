# 🚀 TribeFit Quick Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- Yarn package manager
- Git for version control

## ⚡ Quick Start (5 minutes)

### 1. Clone and Install
```bash
git clone https://github.com/your-username/tribefit.git
cd tribefit
yarn install
```

### 2. Environment Setup
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your credentials (see below)
nano .env  # or use your preferred editor
```

### 3. Run Development Server
```bash
# Start the development server
yarn dev

# Open http://localhost:3000 in your browser
```

## 🔧 Environment Variables Explained

### Quick Setup (Uses Mock Data)
For immediate testing, you can use the default values. The app will run in mock mode:

```bash
# Minimal .env for testing (mock mode)
APP_NAME=TribeFit
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
```

### Production Setup (Real Database)
For production deployment, you need real services:

#### 1. Supabase Setup
```bash
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Go to Settings → API
# 4. Copy these values to your .env:

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-key
```

#### 2. Database Schema
```bash
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Copy all contents from supabase-schema.sql
# 3. Paste and execute the SQL
```

#### 3. Stripe Setup (For Payments)
```bash
# 1. Go to https://stripe.com
# 2. Create account and verify
# 3. Go to Developers → API Keys
# 4. Copy to your .env:

STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

#### 4. Emergent LLM (For AI Features)
```bash
# Add your Emergent LLM key to .env:
EMERGENT_LLM_KEY=sk-emergent-your-key-here
```

## 🎯 Feature Testing

### Mock Mode Features (No Setup Required)
- ✅ User interface and navigation
- ✅ Language switching (EN/FR/JP)
- ✅ Mock workout data
- ✅ UI components and modals
- ✅ Calendar and scheduling UI

### Full Features (Requires Setup)
- 🔐 User registration and authentication
- 💰 Real TribeCoin wallet and payments
- 👥 Tribe creation and joining
- 🗳️ Pact voting with real persistence
- 🤖 AI workout generation
- 📊 Progress tracking and analytics

## 🛠️ Development Commands

```bash
# Development server with hot reload
yarn dev

# Build for production
yarn build

# Run production build locally
yarn start

# Run with no memory limit restrictions
yarn dev:no-reload

# Build and analyze bundle
yarn build && yarn analyze
```

## 📱 Testing the App

### 1. Mock Mode Testing (Default)
```bash
# Features available without setup:
# - UI navigation and language switching
# - Mock data for workouts and users
# - All component interactions
# - Calendar scheduling (UI only)
```

### 2. Database Mode Testing
```bash
# After Supabase setup:
# - Create user account
# - Join/create tribes
# - Real workout tracking
# - Persistent data storage
```

### 3. Payment Testing
```bash
# After Stripe setup, use test cards:
# Success: 4242 4242 4242 4242
# Decline: 4000 0000 0000 0002
# Test TC purchases and wallet top-ups
```

## 🐛 Troubleshooting

### Issue: "Supabase connection failed"
```bash
# Check your .env file:
# - SUPABASE_URL format: https://xxx.supabase.co
# - No trailing slashes
# - Keys are complete (very long strings)
```

### Issue: "Build errors"
```bash
# Clear cache and reinstall:
rm -rf .next node_modules
yarn install
yarn build
```

### Issue: "Payments not working"
```bash
# Verify Stripe keys:
# - Test keys start with pk_test_ and sk_test_
# - Live keys start with pk_live_ and sk_live_
# - Match the account (same Stripe account)
```

### Issue: "AI features not working"
```bash
# Check Emergent LLM key:
# - Key format: sk-emergent-xxxxx
# - Key is active and has credits
# - Network connectivity for API calls
```

## 📚 Next Steps

### For Development
1. Customize the UI components in `/components`
2. Modify API routes in `/app/api`
3. Add new features following existing patterns
4. Test with both mock and real data

### For Deployment
1. Follow `/DEPLOYMENT.md` for production setup
2. Configure domain and SSL certificates
3. Set up monitoring and analytics
4. Test all features end-to-end

## 🆘 Getting Help

- 📖 Check `/DEPLOYMENT.md` for deployment issues
- 🐛 Check GitHub Issues for known problems
- 📧 Create new issue with error details and steps to reproduce

---

**🎉 You're ready to build the future of social fitness!**

*Remember: TribeFit works in mock mode by default, so you can start development immediately even without external services.*