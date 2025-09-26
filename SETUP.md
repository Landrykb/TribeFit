# TribeFit Setup Guide 🏋️‍♂️

**Complete Production-Ready Social Fitness App**

TribeFit is ready to deploy! Just replace placeholder credentials with your actual API keys.

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo>
cd tribefit
yarn install
```

### 2. Set Up Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

Replace the placeholder values in `.env` with your actual credentials:

#### **Required: Supabase Database**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Replace in `.env`:
   ```bash
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### **Required: Stripe Payments**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Get your test API keys
3. Replace in `.env`:
   ```bash
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 3. Set Up Database

Run the complete database schema in your Supabase SQL Editor:
```bash
# Copy the contents of supabase-schema.sql
# Paste and run in Supabase Dashboard → SQL Editor
```

This creates:
- ✅ All tables with proper relationships
- ✅ Row Level Security policies
- ✅ Storage buckets for media uploads
- ✅ Triggers and functions
- ✅ Sample exercise data

### 4. Run Development Server
```bash
yarn dev
```

Visit `http://localhost:3000` - you should see the TribeFit app!

---

## 🔧 Features Status

### ✅ **Ready to Use (M0 - Production Hardening)**
- **Social Accountability System**: Skip workouts → Pay TribeCoins or watch ads → Snitch notifications
- **TribeCoins Virtual Currency**: Full wallet system with real Stripe integration
- **Pact Wallets**: Shared tribe funds from skip penalties
- **Multilingual Support**: English, French, Japanese
- **Database Integration**: Complete Supabase schema with RLS security
- **Media Uploads**: Photos/videos to Supabase Storage
- **Notifications**: Database-stored with push notification ready

### 🚧 **Coming Next (M1-M5)**
- **Workout Tracking**: Rep counting, session logging
- **Watch Companion**: Apple Watch / WearOS integration
- **Coach Marketplace**: Certification system and payments
- **Advanced Features**: Gamification, analytics

---

## 🗂️ Project Structure

```
tribefit/
├── app/
│   ├── api/[[...path]]/route.js    # All API endpoints
│   ├── page.js                     # Main TribeFit UI
│   └── layout.js                   # App layout
├── lib/
│   ├── supabase.js                 # Database client & helpers
│   └── i18n.js                     # Multilingual translations
├── components/ui/                  # Shadcn UI components
├── supabase-schema.sql             # Complete database schema
├── .env.example                    # Environment template
└── SETUP.md                        # This file
```

---

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ Users can only see their own data and tribe data
- ✅ Anon key is safe for client-side use
- ✅ Service role key used only in API routes
- ✅ Storage policies protect user uploads

### Payment Security
- ✅ No card details stored in app
- ✅ Stripe webhooks with signature validation
- ✅ Idempotent payment processing
- ✅ Test mode by default

---

## 🌐 API Endpoints

### Core Features
- `GET /api/user/current` - Get current user profile
- `POST /api/skip` - Skip workout (pay or watch ad)
- `GET /api/pact/wallet` - Get tribe pact wallet
- `GET /api/pact/transactions` - Get transaction history
- `POST /api/wallet/topup` - Create Stripe payment
- `POST /api/stripe/webhook` - Process payments

### Social Features  
- `POST /api/tribe/create` - Create new tribe
- `POST /api/tribe/join` - Join tribe by invite code
- `GET /api/notifications` - Get user notifications
- `POST /api/tip` - Send TribeCoins to other users

### Settings
- `PUT /api/user/settings` - Update user preferences

---

## 🧪 Testing

### Manual Testing
1. **Skip Flow**: Click Skip → Pay 100 TC or Watch Ad → Check wallet balance
2. **Pact Wallet**: View transaction history in Pact tab
3. **Notifications**: Skip should create snitch notification
4. **Payments**: Use Stripe test cards (4242 4242 4242 4242)

### Automated Testing
Run the included test suite:
```bash
yarn test
```

---

## 🚀 Deployment

### Environment Variables for Production
Set these in your hosting platform (Vercel, Netlify, etc.):

```bash
# Database
SUPABASE_URL=your_production_url
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key

# Payments
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...

# App Config
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Stripe Webhook Setup
1. In Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events: `payment_intent.succeeded`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

---

## 🎯 Core Value Delivered

**TribeFit's "Aha" Moment**: Social workout accountability through financial and social pressure

1. **User skips workout** → Must pay 100 TribeCoins OR watch ad
2. **Tribe gets notified** → "Alex Chen PAID to skip 💸. Your tribe is stronger than excuses."
3. **Money pools in Pact Wallet** → Tribe can spend on equipment together
4. **Social pressure works** → Members are accountable even when apart

This core loop is **fully functional** with real payments, database persistence, and multilingual support.

---

## 💬 Support

For questions about setup or development:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase schema was run successfully
4. Test with Stripe test cards first

**Happy building! 🏋️‍♂️✨**