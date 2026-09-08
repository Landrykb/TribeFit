# 🏆 Coach Marketplace System

**Complete implementation guide for TribeFit's Coach Marketplace**

---

## 📋 Overview

The Coach Marketplace is a premium feature that allows experienced TribeFit users to monetize their fitness expertise by becoming coaches, while other users can hire coaches for personalized training.

### Key Benefits

**For Users:**
- ✅ Clear path to monetize fitness expertise
- ✅ Access to qualified, verified coaches
- ✅ Transparent pricing and ratings
- ✅ Premium tribe-exclusive feature

**For Platform:**
- ✅ 10% revenue stream on all sessions
- ✅ Increased user engagement
- ✅ Premium tribe incentive
- ✅ Community building

**For Tribes:**
- ✅ Exclusive benefit for members
- ✅ Internal coaching marketplace
- ✅ Member retention tool
- ✅ Reputation building

---

## 🎯 Eligibility Requirements

To become a coach, users must meet **strict requirements** to ensure quality:

```javascript
{
  minStreak: 14 days,        // 2 weeks of consistent workouts
  minWorkouts: 30,           // 30 total completed workouts
  mustBeInTribe: true,       // Must be in a Tribe (not Squad)
  platformFeePercent: 10     // 10% platform fee on earnings
}
```

### Why These Requirements?

1. **14-day streak** - Proves consistency and commitment
2. **30 workouts** - Demonstrates experience and knowledge
3. **Tribe membership** - Premium feature that encourages upgrades
4. **Platform fee** - Sustainable revenue model

---

## 💰 Economics

### Pricing Structure

```
Default Rate:      150 TC per session
Platform Fee:      15 TC (10%)
Coach Earnings:    135 TC (90%)
```

### Payment Flow

**1. Client Hires Coach:**
```javascript
POST /api/coach/hire
{
  "clientId": "user_123",
  "coachId": "coach_456",
  "priceTc": 150
}
```

**Process:**
- Client's wallet: -150 TC
- Hire record created
- Coach's client count +1

**2. Session Completed:**
```javascript
// Automatic processing
- Platform fee: 15 TC (10%)
- Coach earnings: 135 TC (90%)
- Coach wallet: +135 TC
- Coach profile updated (sessions +1, earnings +135)
```

**3. Client Rates Coach:**
```javascript
POST /api/coach/rate
{
  "coachId": "coach_456",
  "clientId": "user_123",
  "stars": 5,
  "text": "Amazing coach!"
}
```

**Process:**
- Rating added to coach profile
- Average rating recalculated
- High ratings (4+) trigger tribe celebrations

---

## 🏗️ Architecture

### Database Schema

#### Coach Profile
```javascript
{
  id: userId,
  user_id: userId,
  name: "Coach Sarah",
  tribe_id: "tribe_001",
  bio: "Passionate about strength training...",
  specialties: ["Strength", "HIIT", "Nutrition"],
  pricing: { per_session: 150 },
  status: "active",
  avg_rating: 4.8,
  total_sessions: 45,
  clients_count: 12,
  total_earnings_tc: 6075,
  created_at: "2024-01-01T00:00:00.000Z"
}
```

#### Coach Application
```javascript
{
  id: "app_123",
  user_id: "user_123",
  name: "Sarah Johnson",
  tribe_id: "tribe_001",
  status: "pending", // pending, approved, rejected
  created_at: "2024-01-01T00:00:00.000Z",
  approved_at: "2024-01-01T12:00:00.000Z" // if approved
}
```

#### Coach Hire
```javascript
{
  id: "hire_789",
  client_id: "user_123",
  coach_id: "coach_456",
  price_tc: 150,
  status: "active", // active, completed, cancelled
  sessions_count: 0,
  created_at: "2024-01-01T00:00:00.000Z"
}
```

#### Coach Session
```javascript
{
  id: "session_321",
  hire_id: "hire_789",
  coach_id: "coach_456",
  client_id: "user_123",
  price_tc: 150,
  platform_fee_tc: 15,
  coach_earnings_tc: 135,
  created_at: "2024-01-01T00:00:00.000Z"
}
```

#### Coach Rating
```javascript
{
  id: "rating_654",
  hire_id: "hire_789",
  coach_id: "coach_456",
  client_id: "user_123",
  stars: 5,
  text: "Best coach ever! Highly recommend!",
  created_at: "2024-01-01T00:00:00.000Z"
}
```

---

## 🔌 API Reference

### Check Eligibility
```http
GET /api/coach/eligibility?userId={id}
```

**Response:**
```json
{
  "eligible": true,
  "isCoach": false,
  "applicationPending": false,
  "checks": {
    "inTribe": true,
    "streak": true,
    "workouts": true
  },
  "requirements": {
    "minStreak": 14,
    "minWorkouts": 30,
    "mustBeInTribe": true
  },
  "userStats": {
    "streak": 28,
    "totalWorkouts": 45,
    "groupType": "tribe"
  }
}
```

### Apply to Become Coach
```http
POST /api/coach/apply
Content-Type: application/json

{
  "userId": "user_123",
  "name": "Sarah Johnson",
  "tribeId": "tribe_001"
}
```

**Response (Success):**
```json
{
  "success": true,
  "application": { /* application object */ },
  "profile": { /* coach profile object */ },
  "message": "Coach application approved!"
}
```

**Response (Not Eligible):**
```json
{
  "error": "Not eligible to become a coach",
  "requirements": { /* requirements */ },
  "userStats": { /* user's current stats */ }
}
```

### List Coaches
```http
GET /api/coach/list?tribeId={id}
```

**Response:**
```json
{
  "success": true,
  "coaches": [
    {
      "id": "coach_456",
      "name": "Sarah Johnson",
      "tribe_id": "tribe_001",
      "bio": "Passionate strength coach...",
      "specialties": ["Strength", "HIIT"],
      "pricing": { "per_session": 150 },
      "avg_rating": 4.8,
      "total_sessions": 45,
      "clients_count": 12,
      "streak": 28,
      "total_workouts": 150
    }
  ],
  "count": 1
}
```

### Hire Coach
```http
POST /api/coach/hire
Content-Type: application/json

{
  "clientId": "user_123",
  "coachId": "coach_456",
  "priceTc": 150
}
```

**Response:**
```json
{
  "success": true,
  "hire": { /* hire object */ },
  "balances": {
    "wallet": 350,
    "snatched": 0,
    "pact": 100
  },
  "message": "Successfully hired Sarah Johnson!"
}
```

### Rate Coach
```http
POST /api/coach/rate
Content-Type: application/json

{
  "hireId": "hire_789",
  "coachId": "coach_456",
  "clientId": "user_123",
  "stars": 5,
  "text": "Amazing coach!"
}
```

**Response:**
```json
{
  "success": true,
  "rating": { /* rating object */ },
  "coach": { /* updated coach profile with new avg_rating */ },
  "message": "Thank you for rating Sarah Johnson!"
}
```

---

## 🎨 User Interface

### Coach Tab Landing

```
┌──────────────────────────────────────┐
│       🏆 Coach Marketplace           │
│                                      │
│  Get personalized training from      │
│  certified coaches or become one!    │
│                                      │
│     [Open Coach Marketplace]         │
└──────────────────────────────────────┘
```

### Marketplace - Find Coaches Tab

```
Filter: [All Coaches] [My Tribe] [Other Tribes]

┌─────────────────────────────────────┐
│ 💪 Sarah Johnson        Same Tribe  │
│ ⭐⭐⭐⭐⭐ 4.8                      │
│ 🔥 28 days  📈 45 sessions         │
│ 👥 12 clients                       │
│                                     │
│ Specialties: Strength, HIIT         │
│                                     │
│ 💰 150 TC/session                   │
│                                     │
│     [Details]        [Hire]         │
└─────────────────────────────────────┘
```

### Marketplace - Become a Coach Tab

```
┌──────────────────────────────────────┐
│     🏆 Become a TribeFit Coach       │
│                                      │
│  Share your journey and earn TC!    │
└──────────────────────────────────────┘

Eligibility Requirements:

✅ Be part of a Tribe
   Requirement: Must be in Tribe
   Your status: In Tribe ✓

✅ Workout Consistency  
   Requirement: 14+ day streak
   Your status: 28 days

✅ Total Workouts
   Requirement: 30+ workouts
   Your status: 45 workouts

💡 Platform Fee
   TribeFit charges 10% per session
   Example: 150 TC session = 135 TC earnings

🎯 Coach Benefits
   ✅ Earn TribeCoins for expertise
   ✅ Build your reputation
   ✅ Set your own schedule
   ✅ Help others achieve goals
   ✅ Access coach community

        [Apply to Become Coach]
```

### Coach Details Modal

```
┌──────────────────────────────────────┐
│  💪 Sarah Johnson          ⭐ 4.8   │
│                                      │
│  Stats:                              │
│  🔥 28 day streak                    │
│  📈 45 sessions                      │
│  👥 12 clients                       │
│                                      │
│  About:                              │
│  "Passionate about strength training │
│   and helping others achieve their   │
│   fitness goals..."                  │
│                                      │
│  Specialties:                        │
│  • Strength Training                 │
│  • HIIT                              │
│  • Nutrition Advice                  │
│                                      │
│  Price: 150 TC/session              │
│  Your balance: 500 TC                │
│                                      │
│     [Hire Coach for 150 TC]         │
└──────────────────────────────────────┘
```

---

## 💬 Fun Messages

Following the established social interaction pattern:

### Coach Application Messages
```javascript
const messages = [
  '🏆 Coach application submitted! Time to inspire others!',
  '💪 Ready to lead the tribe! Application processing...',
  '🎯 From member to mentor! Coach journey begins!',
  '⚡ Application sent! Prepare to transform lives!',
  '🚀 Coach mode activated! Tribe leadership awaits!'
];
```

### Hire Coach Messages
```javascript
const messages = [
  `🎯 ${coach.name} is now your coach! Time to level up!`,
  `💪 Welcome to Team ${coach.name}! Let's crush those goals!`,
  `🚀 Coach ${coach.name} locked in! Your transformation begins now!`,
  `⚡ ${coach.name} is ready to guide you to greatness!`,
  `🏆 Perfect match! ${coach.name} will help you dominate!`,
  `🔥 Coach ${coach.name} activated! Prepare for epic gains!`
];

// Delayed celebration
setTimeout(() => {
  toast.success('🎉 Your tribe is cheering for this amazing decision!');
}, 2000);
```

### Rating Messages
```javascript
const ratingMessages = {
  5: '⭐⭐⭐⭐⭐ Outstanding! Your coach is a legend!',
  4: '⭐⭐⭐⭐ Excellent work! Great coaching session!',
  3: '⭐⭐⭐ Good session! Room for growth together!',
  2: '⭐⭐ Thanks for feedback. We\'re always improving!',
  1: '⭐ Your input helps us maintain quality coaches.'
};

// High rating celebration
if (stars >= 4) {
  setTimeout(() => {
    toast.success('🎉 Your tribe celebrates great coaching!');
  }, 1500);
}
```

---

## 🧪 Testing Guide

### Test Eligibility

**1. User Not in Tribe:**
```javascript
User: { group_type: 'squad', streak: 20, total_workouts: 40 }
Expected: Not eligible (must be in tribe)
```

**2. User with Low Streak:**
```javascript
User: { group_type: 'tribe', streak: 10, total_workouts: 40 }
Expected: Not eligible (streak < 14)
```

**3. User with Low Workouts:**
```javascript
User: { group_type: 'tribe', streak: 20, total_workouts: 20 }
Expected: Not eligible (workouts < 30)
```

**4. Eligible User:**
```javascript
User: { group_type: 'tribe', streak: 28, total_workouts: 45 }
Expected: Eligible ✓
```

### Test Application

**1. Apply as Eligible User:**
```bash
curl -X POST http://localhost:3000/api/coach/apply \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123","name":"Test Coach","tribeId":"tribe_001"}'
```
Expected: Auto-approved, profile created

**2. Apply Twice:**
```bash
# Second application
curl -X POST http://localhost:3000/api/coach/apply \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_123","name":"Test Coach","tribeId":"tribe_001"}'
```
Expected: Error "Already a coach"

### Test Marketplace

**1. Browse All Coaches:**
```bash
curl http://localhost:3000/api/coach/list
```
Expected: All active coaches

**2. Filter by Tribe:**
```bash
curl http://localhost:3000/api/coach/list?tribeId=tribe_001
```
Expected: Only coaches from tribe_001

**3. Hire Coach (Sufficient Balance):**
```javascript
Client: { wallet_balance_tc: 500 }
Coach: { pricing: { per_session: 150 } }
```
Expected: Success, balance = 350

**4. Hire Coach (Insufficient Balance):**
```javascript
Client: { wallet_balance_tc: 100 }
Coach: { pricing: { per_session: 150 } }
```
Expected: Error "Insufficient balance"

### Test Ratings

**1. Rate 5 Stars:**
```bash
curl -X POST http://localhost:3000/api/coach/rate \
  -H "Content-Type: application/json" \
  -d '{"coachId":"coach_456","clientId":"user_123","stars":5,"text":"Amazing!"}'
```
Expected: Success, celebration message

**2. Average Rating Update:**
```javascript
Ratings: [5, 4, 5, 4, 5]
Expected avg_rating: 4.6
```

---

## 🚀 Implementation Checklist

### Core Functionality ✅
- [x] Eligibility checking system
- [x] Coach application processing
- [x] Auto-approval for eligible users
- [x] Coach profile creation
- [x] Marketplace browsing with filters
- [x] Coach detail modals
- [x] Hiring flow with payments
- [x] Rating system with averages
- [x] Fun celebration messages

### Database ✅
- [x] Coach profiles table
- [x] Coach applications table
- [x] Coach hires table
- [x] Coach sessions table
- [x] Coach ratings table
- [x] Database helper functions

### API Routes ✅
- [x] `/api/coach/eligibility`
- [x] `/api/coach/apply`
- [x] `/api/coach/list`
- [x] `/api/coach/hire`
- [x] `/api/coach/rate`

### UI Components ✅
- [x] CoachMarketplace component
- [x] Coach card component
- [x] Eligibility checker component
- [x] Coach details modal
- [x] Integration in main app

### Features ✅
- [x] Tribe filtering
- [x] Real-time stats display
- [x] Progress tracking
- [x] Platform fee calculations
- [x] Wallet integration
- [x] Error handling
- [x] Loading states
- [x] Responsive design
- [x] Light/dark mode support

---

## 🔮 Future Enhancements

### Phase 2 (Potential)
- [ ] **Manual review system** - Admin dashboard for application approvals
- [ ] **Coach scheduling** - Calendar integration for booking
- [ ] **Session types** - 1-on-1, group, video, text coaching
- [ ] **Package deals** - 5-session discounts, subscriptions
- [ ] **Advanced matching** - AI recommendations based on goals
- [ ] **Coach tools** - Workout builder, progress tracking
- [ ] **Video calls** - Integrated video sessions
- [ ] **Coach badges** - Certifications, specializations
- [ ] **Quality assurance** - Minimum rating requirements
- [ ] **Coach analytics** - Earnings dashboard, client insights

---

## 📊 Success Metrics

### Key Performance Indicators

**Coach Supply:**
- Number of active coaches
- Coach applications per month
- Approval rate
- Average coach rating
- Coach retention rate

**Client Demand:**
- Coaching sessions per month
- Hire conversion rate
- Repeat hiring rate
- Average client satisfaction

**Economics:**
- Platform revenue from fees
- Average coach earnings
- Transaction volume
- Payment success rate

**Engagement:**
- Time to first hire
- Sessions per coach per month
- Client-coach ratio
- Rating participation rate

---

## 🎉 Summary

The Coach Marketplace is a **fully functional, production-ready system** that:

✅ Enables qualified users to become coaches
✅ Provides transparent eligibility requirements  
✅ Creates a sustainable revenue stream (10% platform fee)
✅ Encourages tribe membership (premium feature)
✅ Builds community through coaching relationships
✅ Maintains quality through ratings and reviews
✅ Offers seamless payment integration
✅ Delivers delightful user experience with celebrations

**Total Implementation:**
- ~1000+ lines of code
- 5 API routes
- 10+ database functions
- 1 main component + 3 sub-components
- Full payment integration
- Complete rating system

**Ready for production deployment! 🚀**

---

*Built with ❤️ for the TribeFit community*
