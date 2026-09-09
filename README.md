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
- **Smart Distribution**: Skip payments automatically distribute to tribe members' wallets
- **Wishlist Funding**: Skip fees contribute to shared equipment goals

### 👥 **Social Tribes & Squads**
- **Dual Group System**: Join casual Squads (🔥) or exclusive Tribes (🪶)
- Create or join groups with invite codes
- Shared Tribe Vault funded by skip penalties
- **Squad Interactions**: Real-time reactions, tips, and social pressure
- **Tribe Hierarchy**: Premium groups with higher accountability

### 📱 **Enhanced Skip Flow**
- **Flexible Pricing**: Pay 5-10 TC for rest periods, 10+ TC for full workouts
- **Watch Ads Alternative**: 10-15 second ads as free skip option
- **Smart Distribution**: Payments split among active tribe/squad members
- **Fun Notifications**: Randomized snitch messages with emojis
- **Progress Tracking**: Visual ad progress bars with countdown timers

### 🌍 **Advanced Multilingual Support**
- **Languages**: English, French, Japanese with cultural adaptations
- **Smart Localization**: Context-aware translations for fitness terms
- **Fun Messages**: Localized snitch messages with cultural humor
- **Currency Display**: Shows local currency equivalents (USD, EUR, JPY)
- **Regional Preferences**: Time zones, measurement units, cultural norms

### 🏋️‍♂️ **Advanced Workout System**
- **AI Rep Counting**: On-device MediaPipe for accurate tracking
- **Flexible Options**: Shrink workouts, pay to skip, or watch ads
- **Rest Period Management**: Skip rest with payment or ad viewing
- **Progress Analytics**: Detailed workout history and improvements
- **Smart Scheduling**: AI-powered workout planning
- **Companion Apps**: Apple Watch / WearOS integration (coming soon)
- **Form Analysis**: Real-time feedback on exercise technique

### 👨‍🏫 **Coach Marketplace System** ✅
- **Strict Eligibility**: Only users with 14+ day streaks, 30+ workouts, and Tribe membership can become coaches
- **Premium Tribe Feature**: Exclusive to Tribe members (not Squads) to encourage upgrades
- **Transparent Pricing**: Default 150 TC per session with 10% platform fee
- **Coach Earnings**: Coaches receive 135 TC per session (90% after platform fee)
- **Rating System**: 5-star reviews with automatic average calculations
- **Specializations**: Coaches can list expertise areas (strength, HIIT, nutrition, etc.)
- **Smart Filtering**: Browse all coaches, filter by your tribe, or explore other tribes
- **Coach Profiles**: Detailed stats including streak, sessions completed, clients, and ratings
- **Eligibility Dashboard**: Real-time progress tracker showing requirements to become a coach
- **Auto-Approval**: Eligible users instantly become coaches (ready for manual review in production)
- **Revenue Stream**: 10% platform fee on all coaching sessions funds platform growth

### 🎯 **Wishlist & Equipment Sharing**
- **Collaborative Wishlist**: Tribe members fund shared equipment
- **Progress Tracking**: Visual progress bars for funding goals
- **Smart Prioritization**: AI suggests next equipment based on workouts
- **Catalog Integration**: Browse and add equipment with specs
- **Purchase Notifications**: Celebrate when goals are reached

### 🎮 **Gamification & Social Features**
- **Streak Tracking**: Daily workout streaks with rewards
- **Reaction System**: Send emojis and encouragement to tribe members
- **Leaderboards**: Squad and tribe rankings with friendly competition
- **Achievement Badges**: Unlock rewards for consistency and milestones
- **Social Feed**: Share workout photos and celebrate victories
- **Tip System**: Send TribeCoins to motivate and reward others

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, JavaScript (migrating to TypeScript), Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Payments**: Stripe (cards, wallets, Connect for payouts). If Stripe keys are not configured, the app runs in mock mode and credits wallets immediately for top-ups.
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
- **Groups & Wallets**: Dual group system (Squads/Tribes) with skip-fee distribution
- **Payments**: Top-up via `POST /api/wallet/topup` (Stripe in real mode, instant credit in mock mode)
- **Skip System**: Pay or watch ads to skip; group snitch notifications; 80/20 split in demo mode
- **Calendar**: Local-date scheduling with reminders and native notifications
- **Imports**: Google Calendar and Apple ICS import (keywords filter, de-dupe)
- **Social**: Reactions, tips, feed, streaks, leaderboards basics
- **Wishlist**: Collaborative equipment funding with polished UI
- **Multilingual**: EN/FR/JP with fun localized messages
- **UI/UX**: Light/dark themes, proportional buttons, animations
- **Coach Marketplace**: Full implementation with eligibility, hiring, payments, ratings

### ✅ **Recently Completed**
- **Coach Marketplace System**: Full implementation with eligibility, hiring, payments, and ratings
- **Tribe Premium Benefits**: Coach eligibility exclusive to Tribe members
- **Platform Economics**: 10% revenue share on coaching sessions

### 🚧 **In Development**
- **AI Rep Counting**: MediaPipe integration for accurate tracking
- **Workout Plan Builder**: Rich AI planning beyond calendar entries
- **Watch Apps**: Apple Watch / WearOS companion applications
- **Advanced Analytics**: Detailed progress and performance insights
- **Corporate Wellness**: Enterprise features for workplace fitness
- **Mobile Apps**: React Native iOS/Android applications
- **Device Integration**: Fitness tracker and smart equipment connectivity

## 🎮 Demo

Try the live demo: [TribeFit Demo](https://social-fitness-6.preview.emergentagent.com)

**Demo Features:**
- **Mock User**: "Alex Chen" with 500 TC balance and 28-day streak
- **Active Groups**: Join "Founders Tribe" and "Fire Squad" 
- **Skip Options**: Try payment (5-10 TC) or watch ads (10-15 seconds)
- **Social Features**: Send reactions, tips, and view tribe feed
- **Wishlist System**: Fund shared equipment goals
- **Coach Marketplace**: 
  - Check your eligibility to become a coach (14+ streak, 30+ workouts, tribe member)
  - Browse available coaches with filtering (all/my tribe/other tribes)
  - View detailed coach profiles with stats and ratings
  - Hire coaches for 150 TC per session
  - Rate coaches after sessions
- **Language Support**: Switch between EN/FR/JP with cultural adaptations
- **Gamification**: Earn badges, climb leaderboards, maintain streaks

## 🏗️ Architecture

### Database Schema
- **Users**: Profiles, wallet balances, streaks, achievements, total workouts
- **Groups**: Dual system - Squads (casual) and Tribes (premium)
- **Tribe Vault**: Smart transaction system with auto-distribution
- **Wishlist**: Collaborative equipment funding with progress tracking
- **Workouts**: Sessions, sets, exercises, AI rep counting
- **Social**: Posts, reactions, comments, notifications, tips
- **Coaching**: Comprehensive marketplace system
  - **Coach Profiles**: User ID, name, tribe, bio, specialties, pricing, stats, status
  - **Coach Applications**: User ID, name, tribe, status (pending/approved/rejected)
  - **Coach Hires**: Client ID, coach ID, price, status, session count
  - **Coach Sessions**: Hire ID, coach/client IDs, pricing breakdown, platform fee
  - **Coach Ratings**: Coach ID, client ID, stars (1-5), text feedback, timestamp
- **Gamification**: Streaks, badges, leaderboards, achievements
- **Payments**: Enhanced Stripe integration with smart splitting

### Calendar Integrations
- **Google**: OAuth (scopes: calendar.readonly) with endpoints:
  - `/api/calendar/google/auth`, `/api/calendar/google/callback`
  - `/api/calendar/google/connected`, `/api/calendar/google/list`, `/api/calendar/google/settings` (GET/POST), `/api/calendar/google/import-today`
- **Apple**: ICS import via `/api/calendar/apple/settings` and `/api/calendar/apple/import-ics`

Env keys (development):
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (point to `/api/calendar/google/callback`).
- Stripe keys for real payments: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.

### Security
- Row Level Security (RLS) on all tables
- Anon key safe for client-side use
- Service role key restricted to API routes
- Stripe webhook signature validation
- Media upload policies

## 🌟 Unique Value Propositions

1. **Dual Accountability**: Squad casual support + Tribe premium pressure
2. **Smart Monetization**: Flexible skip pricing with ad alternatives
3. **Collaborative Goals**: Skip fees fund shared equipment wishlist
4. **Social Gamification**: Reactions, tips, streaks, and achievements
5. **Inclusive Earning**: Coach marketplace + tip system for community income
6. **Cultural Intelligence**: Localized humor and cultural fitness norms
7. **Flexible Engagement**: Multiple ways to stay motivated and accountable

## 🗺️ Roadmap

### Phase 1: Core Stability ✅
- [x] Database integration and security
- [x] Payment processing
- [x] Social accountability system
- [x] Multilingual support
 - [x] Calendar scheduling (local-date) with reminders and native notifications
 - [x] Google/Apple calendar import (keywords filter, de-dupe)

### Phase 2: Workout Experience 🚧
- [ ] AI rep counting integration
- [ ] Watch companion apps
- [ ] Workout plan builder (expand beyond calendar-derived plan)
- [ ] Progress tracking

## ✅ Recent Improvements

### Coach Marketplace System (December 2024)
- **Complete marketplace implementation**: Browse, hire, and rate coaches
- **Strict eligibility system**: 14+ day streak, 30+ workouts, Tribe membership required
- **Premium tribe feature**: Only Tribe members can become coaches
- **Payment integration**: 150 TC per session, 10% platform fee, automatic payouts
- **Rating system**: 5-star reviews with real-time average calculations
- **Smart filtering**: All coaches, my tribe, or other tribes
- **Detailed profiles**: Coach stats, specialties, bios, and client counts
- **Eligibility dashboard**: Real-time progress tracker for aspiring coaches
- **Auto-approval**: Instant activation for eligible users
- **Fun messaging**: Celebration messages following social interaction patterns
- **Files created/modified**:
  - `components/CoachMarketplace.jsx` (350+ lines) - Main marketplace UI
  - `app/api/coach/eligibility/route.js` - Eligibility checking
  - `app/api/coach/apply/route.js` - Application processing
  - `app/api/coach/hire/route.js` - Hiring and payment
  - `app/api/coach/list/route.js` - Coach browsing
  - `app/api/coach/rate/route.js` - Rating submission
  - `app/api/_store/db.js` (+220 lines) - Coach database functions
  - `app/page.js` - Integration and handlers

### Previous Updates
- **Fixed local date bugs**: All scheduling now uses local dates (no UTC off-by-one). Affects calendar grid, reminders, and Today's Plan (`app/page.js`, `components/WorkoutCalendar.jsx`, `components/WorkoutScheduler.jsx`).
- **Start Workout matches schedule**: Start button now launches a session built from today's scheduled item (uses saved `ai_plan` or a generated plan with the scheduled title and duration) (`app/page.js`, `components/WorkoutSession.jsx`).
- **Top-up endpoint aligned**: UI calls `POST /api/wallet/topup` and supports both Stripe (client_secret) and mock instant credit (`app/page.js`, `app/api/[[...path]]/route.js`).
- **Calendar imports**: Google and Apple ICS routes added with keyword filtering and de-duplication (various under `app/api/calendar/`).

## 🔧 Developer Notes

### Developer Controls 🛠️

**Floating control panel for rapid testing** (bottom-right purple button in dev mode)

**Features:**
- **Multi-User Testing**: Create and switch between test users
- **Stat Manipulation**: Adjust streaks, workouts, balances instantly
- **Group Management**: Join tribes/squads with one click
- **Test Scenarios**: Trigger skip notifications, snatch events
- **Quick Presets**: Newbie, Coach Ready, Veteran, Legend profiles
- **Real-time Updates**: See changes immediately

**Usage:**
1. Click "Dev Controls" button (bottom-right)
2. Create test users or use seeded users (Alice, Bob, Carol)
3. Adjust stats, join groups, trigger events
4. Open multiple tabs for multi-user testing

**See:** [Developer Controls Guide](./docs/DEVELOPER_CONTROLS.md) for complete documentation

**Available Groups:**
- Default Tribe (🪶) - Pre-seeded with Alice, Bob, Carol
- Fire Squad (🔥) - Empty squad for testing
- Founders Tribe (🪶) - Empty tribe for testing

### Coach Marketplace API
- **`GET /api/coach/eligibility?userId={id}`** - Check if user meets coach requirements
- **`POST /api/coach/apply`** - Submit coach application (auto-approved if eligible)
  ```json
  { "userId": "user_id", "name": "Coach Name", "tribeId": "tribe_id" }
  ```
- **`GET /api/coach/list?tribeId={id}`** - Browse coaches (optional tribe filter)
- **`POST /api/coach/hire`** - Hire a coach (deducts TC from client wallet)
  ```json
  { "clientId": "user_id", "coachId": "coach_id", "priceTc": 150 }
  ```
- **`POST /api/coach/rate`** - Rate a coach after session
  ```json
  { "coachId": "coach_id", "clientId": "user_id", "stars": 5, "text": "Great coach!" }
  ```

### Payment Flows
- **Top-up**: In mock mode credits immediately; in Stripe mode, use the returned `client_secret` for payment flow
- **Skip flow**: Demo uses `/api/skip/pay` (80% to members, 20% vault). Supabase-backed `/api/skip` available for production
- **Coach payments**: 90% to coach, 10% platform fee, automatic wallet credit

### Phase 3: Coach Ecosystem ✅ 🔄
- [x] **Eligibility system** - Automated scoring based on streak, workouts, and tribe membership
- [x] **Coach marketplace** - Browse, hire, and rate coaches
- [x] **Payment system** - 150 TC per session with 10% platform fee
- [x] **Rating system** - 5-star reviews with automatic averages
- [x] **Tribe exclusivity** - Premium feature for tribe members only
- [ ] Advanced coach tools (scheduling, workout builder for clients)
- [ ] Subscription models and package deals
- [ ] Certification partnerships
- [ ] Group coaching sessions
- [ ] Video call integration

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