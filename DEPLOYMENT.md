# 🚀 TribeFit Deployment Guide

## 📋 What You Need Before Deployment

### 1. **Required Services & API Keys**
- **Supabase Account** (Database & Auth)
- **Stripe Account** (Payments)
- **Domain** (for production deployment)
- **Hosting Platform** (Vercel/Netlify/Railway recommended)

### 2. **Environment Variables Required**
All these need to be set in your deployment platform:

```bash
# App Configuration
APP_NAME=TribeFit
APP_DEFAULT_LOCALE=en
SUPPORTED_LOCALES=en,fr,ja

# Your Domain (CRITICAL - must be your actual domain)
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Supabase (Get from https://supabase.com/dashboard)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-key

# Stripe (Get from https://dashboard.stripe.com/apikeys)
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_secret_key_here

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
EMERGENT_LLM_KEY=sk-emergent-your-key-here

# Feature Flags
FEATURE_SNITCH_MODE=true
FEATURE_PACT_WALLET=true
FEATURE_COACH_MARKETPLACE=true
```

---

## 🏗️ Step-by-Step Deployment

### Step 1: Set Up Supabase Database

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com
   # Click "New Project"
   # Choose organization and name your project
   ```

2. **Run Database Schema**
   ```bash
   # Copy all content from /app/supabase-schema.sql
   # Go to Supabase Dashboard → SQL Editor
   # Paste and run the entire schema
   ```

3. **Get API Keys**
   ```bash
   # Go to Settings → API
   # Copy:
   # - Project URL (SUPABASE_URL)
   # - anon public key (SUPABASE_ANON_KEY) 
   # - service_role key (SUPABASE_SERVICE_ROLE_KEY)
   ```

### Step 2: Set Up Stripe Payments

1. **Create Stripe Account**
   ```bash
   # Go to https://stripe.com
   # Create business account
   # Complete verification process
   ```

2. **Get API Keys**
   ```bash
   # Go to Developers → API Keys
   # Copy:
   # - Publishable key (STRIPE_PUBLISHABLE_KEY)
   # - Secret key (STRIPE_SECRET_KEY)
   ```

### Step 3: Deploy to Vercel (Recommended)

1. **Connect GitHub Repository**
   ```bash
   # Push your code to GitHub
   # Go to https://vercel.com
   # Import your GitHub repository
   ```

2. **Set Environment Variables**
   ```bash
   # In Vercel Dashboard → Settings → Environment Variables
   # Add all the variables listed above
   ```

3. **Deploy**
   ```bash
   # Vercel will automatically deploy
   # Your app will be available at https://your-app.vercel.app
   ```

---

## 🔧 Alternative Deployment Options

### Option 1: Railway
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
railway login
railway init
railway add --service postgresql
railway deploy
```

### Option 2: Netlify
```bash
# 1. Build the app
npm run build

# 2. Deploy to Netlify
# Upload the .next folder or connect via Git
```

### Option 3: Digital Ocean App Platform
```bash
# 1. Create new app
# 2. Connect GitHub repo  
# 3. Add environment variables
# 4. Deploy
```

### Option 4: Self-Hosted (Docker)
```bash
# 1. Build Docker image
docker build -t tribefit .

# 2. Run with environment variables
docker run -p 3000:3000 \
  -e SUPABASE_URL=your-url \
  -e SUPABASE_ANON_KEY=your-key \
  -e STRIPE_SECRET_KEY=your-stripe-key \
  tribefit
```

---

## 🧪 Testing Your Deployment

### 1. **Health Check**
```bash
# Visit your deployed URL
# Should see TribeFit landing page with language selector
# Check browser console for errors
```

### 2. **Database Connection**
```bash
# Try creating an account
# Should successfully register and login
# Check Supabase Dashboard → Authentication → Users
```

### 3. **Payment Testing**
```bash
# Use Stripe test cards:
# 4242 4242 4242 4242 (Visa)
# 4000 0000 0000 0002 (Declined)
# Test TribeCoin purchases
```

### 4. **Core Features**
```bash
# ✅ User registration/login
# ✅ Wallet balance display  
# ✅ Skip workout flow (pay/ad)
# ✅ Tribe creation/joining
# ✅ Language switching (EN/FR/JP)
# ✅ Pact voting system
# ✅ Calendar scheduling
```

---

## ❌ What's Missing from GitHub Version

### 1. **Environment Variables File**
```bash
# Missing: Real .env with actual API keys
# You need: Copy .env.example → .env and fill in real values
```

### 2. **Database Connection**
```bash
# Missing: Actual Supabase project connection
# You need: Run supabase-schema.sql in your Supabase dashboard
```

### 3. **Payment Configuration**
```bash  
# Missing: Real Stripe account integration
# You need: Stripe account with live/test API keys
```

### 4. **Domain Configuration**
```bash
# Missing: Production domain setup
# You need: Update NEXT_PUBLIC_BASE_URL to your actual domain
```

### 5. **AI Integration**
```bash
# Missing: Working AI workout generation (API key issue)
# You need: Valid Emergent LLM key or OpenAI API key
```

---

## 🐛 Common Deployment Issues & Fixes

### Issue 1: "Supabase Client Error"
```bash
# Problem: Invalid Supabase credentials
# Fix: Double-check URL and keys from Supabase dashboard
# Ensure no trailing slashes in SUPABASE_URL
```

### Issue 2: "Build Failed"
```bash
# Problem: Missing dependencies or build errors
# Fix: Run locally first: npm run build
# Check for TypeScript/ESLint errors
```

### Issue 3: "Database Connection Failed"  
```bash
# Problem: RLS policies or missing schema
# Fix: Run complete supabase-schema.sql
# Check Supabase logs in dashboard
```

### Issue 4: "Payments Not Working"
```bash  
# Problem: Stripe webhook configuration
# Fix: Add webhook endpoint in Stripe dashboard
# URL: https://your-domain.com/api/stripe/webhook
```

### Issue 5: "Features Not Loading"
```bash
# Problem: Environment variables not set correctly
# Fix: Verify all env vars in deployment platform
# Restart/redeploy after adding variables
```

---

## 🔐 Security Checklist

### Production Security
- ✅ Use HTTPS only (automatic with Vercel/Netlify)
- ✅ Set strong JWT_SECRET (min 32 characters)
- ✅ Use Stripe live keys (not test) for production
- ✅ Enable Supabase RLS policies (already in schema)
- ✅ Secure webhook endpoints
- ✅ Set proper CORS origins

### Environment Variables Security
```bash
# ❌ Never commit .env files to Git
# ✅ Use deployment platform's secure env vars
# ✅ Rotate keys regularly
# ✅ Use different keys for staging/production
```

---

## 📊 Monitoring & Analytics

### Application Monitoring
```bash
# Add to your deployment:
SENTRY_DSN=your-sentry-dsn  # Error tracking
ANALYTICS_ID=your-ga-id     # Google Analytics
```

### Database Monitoring
```bash
# Supabase automatically provides:
# - Query performance metrics
# - Connection pool monitoring  
# - Error logs
# Access via Supabase Dashboard → Logs
```

---

## 🚀 Ready for Production Checklist

- [ ] ✅ Supabase project created with schema deployed
- [ ] ✅ Stripe account verified with live API keys  
- [ ] ✅ Domain purchased and DNS configured
- [ ] ✅ All environment variables set in deployment platform
- [ ] ✅ SSL certificate configured (automatic with most hosts)
- [ ] ✅ Error tracking setup (Sentry recommended)
- [ ] ✅ Backup strategy for database
- [ ] ✅ Performance monitoring enabled
- [ ] ✅ User registration flow tested
- [ ] ✅ Payment flow tested with real cards
- [ ] ✅ All core features working

---

## 🎯 Post-Deployment Tasks

### 1. **Set Up Monitoring**
```bash
# Enable Supabase realtime for notifications
# Set up error alerts
# Configure performance monitoring
```

### 2. **User Onboarding**
```bash  
# Create first tribe for testing
# Invite initial users
# Test all user flows end-to-end
```

### 3. **Marketing Setup**
```bash
# Add Google Analytics
# Set up social media links  
# Configure SEO metadata
```

**🎉 Your TribeFit app is now live and ready for users!**

Need help? Check the troubleshooting section or create an issue in the GitHub repository.