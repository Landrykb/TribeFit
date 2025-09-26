# TribeFit - Social Pact Fitness App 🏋️‍♂️

**"Stronger together. One tribe, one pact."**

A social fitness app where friends (your "tribe") keep each other accountable through financial pacts and friendly social pressure.

## 🎯 The "Aha" Moment

TribeFit solves workout accountability through social and financial pressure:

1. **Skip a workout?** → Pay 100 TribeCoins OR watch an ad
2. **Your tribe gets notified** → "Alex PAID to skip 💸. Your tribe is stronger than excuses."
3. **Money pools together** → Tribe spends pooled skip fees on equipment
4. **Social pressure works** → Stay accountable even when apart

## ✨ Key Features

### 💰 **TribeCoins Virtual Currency**
- Wallet system with real Stripe integration
- Top-up with credit cards, Apple Pay, Google Pay
- 1 TC = $1 USD (shows local currency equivalents)

### 👥 **Social Tribes**
- Create or join tribes with invite codes
- Shared Pact Wallets funded by skip penalties
- Group chat and shared workout calendar

### 📱 **Skip Flow (Core Feature)**
- Skip workouts by paying 100 TC or watching ads
- "Snitch Mode" sends localized notifications to tribe
- Builds social pressure and accountability

### 🌍 **Multilingual Support**
- English, French, Japanese
- Localized snitch messages and currency display
- In-app language switching

### 🏋️‍♂️ **Workout System**
- AI rep counting (on-device MediaPipe)
- "Shrink workout" for busy days
- Apple Watch / WearOS companion apps

### 👨‍🏫 **Coach Marketplace**
- Certification system based on consistency scores
- Pay coaches in TribeCoins
- 1-on-1 training, group programs, form checks

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Payments**: Stripe (cards, wallets, Connect for payouts)
- **Database**: Supabase with Row Level Security
- **Storage**: Supabase Storage (photos/videos)
- **Auth**: Supabase Auth
- **Mobile**: React Native (Expo) - *coming soon*
- **Watch**: Apple Watch / WearOS - *coming soon*

## 🏃‍♂️ Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

```bash
# 1. Install dependencies
yarn install

# 2. Copy environment template
cp .env.example .env

# 3. Add your Supabase and Stripe keys to .env

# 4. Run database schema in Supabase SQL Editor
# (copy contents of supabase-schema.sql)

# 5. Start development server
yarn dev
```

## 📊 Current Status

### ✅ **Production Ready (M0)**
- Complete database schema with RLS security
- TribeCoins wallet with Stripe integration
- Skip flow with real payments and notifications
- Pact wallets with transaction history
- Multilingual support (EN/FR/JP)
- Media upload to Supabase Storage

### 🚧 **In Development**
- Workout tracking and rep counting
- Watch companion apps
- Coach certification automation
- Gamification and streaks
- Mobile apps (React Native)

## 🎮 Demo

Try the live demo: [TribeFit Demo](https://workout-pact-1.preview.emergentagent.com)

**Demo Features:**
- Mock user "Alex Chen" with 500 TC balance
- "Founders Tribe" with active Pact Wallet
- Skip functionality (try both "Pay" and "Watch Ad")
- Language switching (EN/FR/JP)
- Transaction history and notifications

## 🏗️ Architecture

### Database Schema
- **Users**: Profiles, wallet balances, settings
- **Tribes**: Groups with invite codes and pact wallets
- **Pact System**: Transactions, wallets, spending requests
- **Workouts**: Sessions, sets, exercises, rep counting
- **Social**: Posts, comments, notifications, tips
- **Coaching**: Applications, profiles, offerings, clients
- **Payments**: Stripe integration with webhook handling

### Security
- Row Level Security (RLS) on all tables
- Anon key safe for client-side use
- Service role key restricted to API routes
- Stripe webhook signature validation
- Media upload policies

## 🌟 Unique Value Propositions

1. **Social Accountability**: Friends keep you accountable even when apart
2. **Financial Pressure**: Skip fees create real consequences
3. **Shared Goals**: Pooled money for equipment creates team motivation
4. **Inclusive Community**: Coach marketplace allows members to earn
5. **Cultural Sensitivity**: Full multilingual support for global tribes

## 🗺️ Roadmap

### Phase 1: Core Stability ✅
- [x] Database integration and security
- [x] Payment processing
- [x] Social accountability system
- [x] Multilingual support

### Phase 2: Workout Experience 🚧
- [ ] AI rep counting integration
- [ ] Watch companion apps
- [ ] Workout plan builder
- [ ] Progress tracking

### Phase 3: Coach Ecosystem 🔄
- [ ] Automated eligibility scoring
- [ ] Advanced coach tools
- [ ] Revenue sharing system
- [ ] Certification partnerships

### Phase 4: Platform Growth 📈
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced gamification
- [ ] Corporate wellness programs
- [ ] Fitness device integrations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Follow setup instructions in [SETUP.md](./SETUP.md)
3. Create a feature branch
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- **Stripe** for robust payment processing
- **Supabase** for the excellent backend-as-a-service
- **Shadcn/ui** for beautiful, accessible components
- **MediaPipe** for on-device AI rep counting
- The fitness community for inspiration and feedback

---

**Built with ❤️ for fitness enthusiasts who believe in the power of community accountability.**

*"Your tribe is stronger than your excuses."* 💪