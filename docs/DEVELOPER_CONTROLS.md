# 🛠️ Developer Controls Guide

**Comprehensive testing tools for TribeFit development**

---

## 📋 Overview

Developer Controls is a powerful floating panel that enables rapid testing of all TribeFit features including tribes, squads, skip notifications, coach marketplace, snatching TCs, and multi-user scenarios.

### Key Features

✅ **Multi-User Testing** - Create and switch between test users instantly  
✅ **Stat Manipulation** - Adjust streaks, workouts, and balances on the fly  
✅ **Group Management** - Join tribes and squads with one click  
✅ **Test Scenarios** - Trigger skip notifications and snatch events  
✅ **Quick Presets** - One-click user profiles (Newbie, Coach Ready, Veteran, Legend)  
✅ **Real-time Updates** - See changes immediately across the app  

---

## 🚀 Quick Start

### Accessing Developer Controls

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Look for the purple floating button** in the bottom-right corner that says "Dev Controls"

3. **Click to expand** the full control panel

### Basic Workflow

**Single User Testing:**
1. Create a test user
2. Adjust their stats (streak, workouts, balance)
3. Join a tribe or squad
4. Test features

**Multi-User Testing:**
1. Create multiple test users
2. Open app in separate browser tabs
3. Switch each tab to a different user
4. Test interactions between users

---

## 🎮 Interface Overview

### Control Panel Sections

```
┌─────────────────────────────────┐
│  🛡️ Developer Controls          │
├─────────────────────────────────┤
│  Current User Info              │
│  - Name, Streak, Workouts       │
│  - Wallet & Snatched Balance    │
├─────────────────────────────────┤
│  Quick Actions                  │
│  - Max Stats, Coach Ready       │
│  - +7 Streak, +10 Workouts      │
│  - +500 TC, +100 Snatch         │
├─────────────────────────────────┤
│  Adjust Stats                   │
│  - Streak Days: -1, +1, +14     │
│  - Workouts: -5, +5, +30        │
│  - Wallet TC: -100, +100, +500  │
├─────────────────────────────────┤
│  User Management                │
│  - Create new test users        │
│  - Switch between users         │
│  - User list with stats         │
├─────────────────────────────────┤
│  Group Management               │
│  - Join Default Tribe           │
│  - Join Fire Squad              │
│  - Join Founders Tribe          │
├─────────────────────────────────┤
│  Test Scenarios                 │
│  - Trigger skip notification    │
│  - Receive snatched TC          │
│  - Break streak                 │
├─────────────────────────────────┤
│  User Presets                   │
│  - Newbie, Coach Ready          │
│  - Veteran, Legend              │
└─────────────────────────────────┘
```

---

## 📝 Features in Detail

### 1. Current User Info

**Displays:**
- User name
- Current streak (days)
- Total workouts completed
- Wallet balance (TC)
- Snatched balance (TC)

**Visual:**
```
┌─────────────────────────────┐
│ Current User                │
│ Alex Chen                   │
│ 🔥 28 days • 💪 45 workouts │
│ 💰 500 TC • ⚡ 200 Snatched │
└─────────────────────────────┘
```

---

### 2. Quick Actions

**Max Stats** - Set maximum values:
- Streak: 30 days
- Workouts: 100
- Wallet: 1000 TC
- Snatched: 500 TC

**Coach Ready** - Meet coach eligibility requirements:
- Streak: 14 days
- Workouts: 30
- Group: Tribe membership

**+7 Streak** - Add one week to streak  
**+10 Workouts** - Add 10 completed workouts  
**+500 TC** - Add 500 TribeCoins to wallet  
**+100 Snatch** - Add 100 snatched TC  

---

### 3. Adjust Stats

**Fine-grained control over user statistics:**

**Streak Days:**
- `-1` - Decrease by 1 day
- `+1` - Increase by 1 day
- `+14` - Add 2 weeks (coach requirement)

**Total Workouts:**
- `-5` - Decrease by 5
- `+5` - Increase by 5
- `+30` - Add 30 (coach requirement)

**Wallet TC:**
- `-100` - Deduct 100 TC
- `+100` - Add 100 TC
- `+500` - Add 500 TC

---

### 4. User Management

**Create Test User:**

1. Enter a name or leave empty for random
2. Click the `+` button
3. User created with default stats:
   - Streak: 0 days
   - Workouts: 0
   - Wallet: 500 TC
   - Snatched: 0 TC

**Random Names Pool:**
- Sarah Johnson
- Mike Chen
- Emily Rodriguez
- James Kim
- Lisa Thompson
- David Martinez
- Jessica Wu
- Tom Anderson

**Switch Between Users:**

Click any user in the list to switch to them. The current user is highlighted with a crown icon 👑.

```
┌───────────────────────────┐
│ Sarah Johnson       👑    │
│ 🔥 14 • 💪 30             │
├───────────────────────────┤
│ Mike Chen                 │
│ 🔥 5 • 💪 10              │
└───────────────────────────┘
```

---

### 5. Group Management

**Available Groups:**

**Default Tribe** (🪶)
- Type: Tribe
- Pre-seeded members: Alice, Bob, Carol
- Vault: 300 TC

**Fire Squad** (🔥)
- Type: Squad
- Empty, ready for testing
- Vault: 150 TC

**Founders Tribe** (🪶)
- Type: Tribe
- Empty, ready for testing
- Vault: 500 TC

**Join a Group:**

Click any group button to add the current user to that group. User's `group_type` is automatically set to match.

---

### 6. Test Scenarios

**Trigger Skip Notification:**
- Creates a skip notification
- Shows in notification feed
- Tests snitch message system
- Format: "Alex PAID to skip! 💸 Your tribe is stronger than excuses."

**Receive Snatched TC (50):**
- Adds 50 TC to snatched balance
- Creates snatch notification
- Tests skip payment distribution
- Shows toast: "+50 TC snatched! 💰"

**Break Streak:**
- Resets streak to 0
- Then sets to 1 (restart)
- Tests streak recovery flow
- Useful for testing motivational messages

---

### 7. User Presets

**Newbie** - New user profile:
- Streak: 5 days
- Workouts: 10
- Wallet: 200 TC
- Group: Squad

**Coach Ready** - Meets coach eligibility:
- Streak: 14 days
- Workouts: 30
- Wallet: 500 TC
- Group: Tribe ✅

**Veteran** - Experienced user:
- Streak: 30 days
- Workouts: 100
- Wallet: 1000 TC
- Group: Tribe

**Legend** - Elite status:
- Streak: 100 days
- Workouts: 500
- Wallet: 5000 TC
- Snatched: 2000 TC
- Group: Tribe

---

## 🧪 Testing Workflows

### Test Case 1: Coach Marketplace

**Goal:** Test coach application and hiring flow

1. **Setup:**
   ```
   - Create User A (coach candidate)
   - Set stats: Streak 14, Workouts 30
   - Join Founders Tribe
   ```

2. **Apply as Coach:**
   ```
   - Go to Coach tab
   - Click "Open Coach Marketplace"
   - Check eligibility ✅
   - Click "Apply to Become Coach"
   - Verify success message
   ```

3. **Create Client:**
   ```
   - Create User B
   - Set wallet: 1000 TC
   - Join Founders Tribe
   ```

4. **Hire Coach:**
   ```
   - Switch to User B
   - Go to Coach Marketplace
   - Find User A in "My Tribe" filter
   - Click "Hire" (150 TC)
   - Verify wallet deduction
   - Verify success message
   ```

5. **Rate Coach:**
   ```
   - Click on hired coach
   - Submit 5-star rating
   - Verify celebration messages
   ```

---

### Test Case 2: Skip Notifications & Snatching

**Goal:** Test skip payment distribution

1. **Setup Multi-User:**
   ```
   - Create Users A, B, C
   - All join Default Tribe
   - User A: 500 TC wallet
   ```

2. **Trigger Skip (User A):**
   ```
   - Click "Trigger Skip Notification"
   - Verify notification appears
   - Check message format
   ```

3. **Simulate Distribution:**
   ```
   - Switch to User B
   - Click "Receive Snatched TC (50)"
   - Verify +50 snatched balance
   - Verify notification
   ```

4. **Repeat for User C:**
   ```
   - Same process
   - Test 80/20 split simulation
   ```

---

### Test Case 3: Tribe vs Squad Features

**Goal:** Test tribe-exclusive features

1. **Squad User:**
   ```
   - Create User A
   - Join Fire Squad
   - Try to become coach → Should fail (need tribe)
   ```

2. **Tribe User:**
   ```
   - Switch User A to Founders Tribe
   - Add streak and workouts
   - Try to become coach → Should succeed ✅
   ```

3. **Feature Access:**
   ```
   - Test vault access
   - Test skip mode settings
   - Test coach marketplace visibility
   ```

---

### Test Case 4: Streak & Workout Progression

**Goal:** Test stat progression and achievements

1. **Start New User:**
   ```
   - Create User A
   - Initial: 0 streak, 0 workouts
   ```

2. **Simulate Growth:**
   ```
   - +1 Streak daily
   - +1 Workout per session
   - Watch for milestone messages
   ```

3. **Test Streak Break:**
   ```
   - At 20 day streak
   - Click "Break Streak"
   - Verify reset to 0 → 1
   - Test recovery messages
   ```

---

### Test Case 5: Multi-Tab Testing

**Goal:** Test real-time interactions

1. **Setup:**
   ```
   - Create Users A, B, C
   - All in Default Tribe
   - Open 3 browser tabs
   ```

2. **Tab 1 (User A):**
   ```
   - Set user ID/name via old dev controls
   - Trigger skip notification
   ```

3. **Tab 2 (User B):**
   ```
   - Switch to User B
   - Verify skip notification appears
   - Add reaction to notification
   ```

4. **Tab 3 (User C):**
   ```
   - Switch to User C
   - Post workout completion
   - All tabs see update via SSE
   ```

---

## 🎯 API Endpoints

### User Management

**List All Users:**
```http
GET /api/dev/users
```

**Create Test User:**
```http
POST /api/dev/users
Content-Type: application/json

{
  "action": "create",
  "name": "Test User"
}
```

**Update User Stats:**
```http
POST /api/dev/users
Content-Type: application/json

{
  "action": "update",
  "userId": "test_123",
  "updates": {
    "streak": 14,
    "total_workouts": 30,
    "wallet_balance_tc": 1000,
    "snatched_balance_tc": 200
  }
}
```

**Get User:**
```http
POST /api/dev/users
Content-Type: application/json

{
  "action": "get",
  "userId": "test_123"
}
```

---

### Group Management

**List All Groups:**
```http
GET /api/dev/groups
```

**Add User to Group:**
```http
POST /api/dev/groups
Content-Type: application/json

{
  "userId": "test_123",
  "groupId": "10000000-0000-0000-0000-000000000001"
}
```

---

## 🔧 Database Functions

### User Functions

**createTestUser(name)**
- Creates new test user with random ID
- Default: 500 TC, 0 streak, 0 workouts
- Returns: User object

**updateUserStats(userId, updates)**
- Updates user statistics
- Fields: streak, total_workouts, wallet_balance_tc, snatched_balance_tc, group_type, group_id
- Returns: Updated user object

**addUserToGroup(userId, groupId)**
- Adds user to group
- Updates user.group_id and user.group_type
- Adds user to group.members
- Returns: { user, group }

**listAllUsers()**
- Returns all users in database
- Returns: Array of user objects

**getAllGroups()**
- Returns all groups (tribes and squads)
- Returns: Array of group objects

---

## 💡 Tips & Best Practices

### Multi-User Testing

1. **Use separate browser windows/tabs** for each user
2. **Use the old dev controls** (top of page) to set user ID/name per tab
3. **Keep dev controls open** in one tab for quick switching
4. **Use meaningful names** to track users easily

### Performance Testing

1. **Create 10+ users** to test leaderboards
2. **Populate with varied stats** for realistic ranking
3. **Join multiple groups** to test filtering
4. **Trigger many notifications** to test pagination

### Coach Marketplace Testing

1. **Create coaches with different stats** (ratings, sessions, prices)
2. **Test all filters** (All, My Tribe, Other Tribes)
3. **Verify eligibility checks** for edge cases
4. **Test hiring with insufficient balance**

### Skip & Snatch Testing

1. **Create group with 5+ members** for distribution testing
2. **Test skip modes** (Teammate Boost vs Tribe Fund)
3. **Verify 80/20 split** calculations
4. **Test ad watching vs payment** flows

---

## 🐛 Troubleshooting

### Controls Not Showing

**Issue:** Dev controls button not visible

**Solution:**
- Check `NODE_ENV` is not 'production'
- Verify `devMode` state is true
- Check browser console for errors

### User Switch Not Working

**Issue:** Switching user doesn't update UI

**Solution:**
- Refresh the page after switching
- Check `effectiveUserId` in console
- Verify API call succeeded

### Stats Not Updating

**Issue:** Updated stats don't reflect in app

**Solution:**
- Check API response in Network tab
- Verify `loadInitialData()` is called
- Try refreshing the page

### Groups Not Loading

**Issue:** Group list is empty

**Solution:**
- Check `/api/dev/groups` response
- Verify database seeding
- Check browser console for errors

---

## 📊 Seeded Data

### Default Users

**Alice:**
- ID: `u_alice`
- Streak: 5 days
- Workouts: 10
- Wallet: 500 TC
- Group: Default Tribe

**Bob:**
- ID: `u_bob`
- Streak: 8 days
- Workouts: 15
- Wallet: 525 TC
- Group: Default Tribe

**Carol:**
- ID: `u_carol`
- Streak: 11 days
- Workouts: 20
- Wallet: 550 TC
- Group: Default Tribe

### Default Groups

**Default Tribe:**
- ID: `10000000-0000-0000-0000-000000000001`
- Type: Tribe
- Members: Alice, Bob, Carol
- Vault: 300 TC

**Fire Squad:**
- ID: `10000000-0000-0000-0000-000000000002`
- Type: Squad
- Members: None
- Vault: 150 TC

**Founders Tribe:**
- ID: `10000000-0000-0000-0000-000000000003`
- Type: Tribe
- Members: None
- Vault: 500 TC

---

## 🎉 Complete Test Checklist

### Core Features
- [ ] Create multiple test users
- [ ] Switch between users successfully
- [ ] Adjust streak and workout stats
- [ ] Add/remove wallet balance
- [ ] Join different tribes and squads

### Coach Marketplace
- [ ] Check eligibility requirements
- [ ] Apply to become coach (eligible user)
- [ ] Apply to become coach (ineligible user)
- [ ] Hire a coach successfully
- [ ] Hire with insufficient balance
- [ ] Rate a coach (1-5 stars)
- [ ] Filter coaches (All/My Tribe/Other)

### Skip & Snatch
- [ ] Trigger skip notification
- [ ] Receive snatched TC
- [ ] Verify 80/20 distribution simulation
- [ ] Test in both Squad and Tribe
- [ ] Test skip mode toggle

### Social Features
- [ ] Post to feed
- [ ] React to notifications
- [ ] Send tips to users
- [ ] Vote on proposals
- [ ] View leaderboards

### Streak & Progression
- [ ] Build streak to 14+ days
- [ ] Complete 30+ workouts
- [ ] Break streak and restart
- [ ] Test milestone messages
- [ ] Verify achievement unlocks

### Multi-Tab Testing
- [ ] Open 3+ tabs with different users
- [ ] Trigger events in one tab
- [ ] Verify SSE updates in other tabs
- [ ] Test concurrent interactions
- [ ] Test notification delivery

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Bulk user creation (10+ at once)
- [ ] Group creation tool
- [ ] Time travel (simulate days passing)
- [ ] Workout session simulator
- [ ] Automated test scenarios
- [ ] Export/import test data
- [ ] Performance metrics dashboard
- [ ] Memory usage monitoring

---

## 📄 Summary

**Developer Controls provides:**

✅ **Instant user creation and switching**  
✅ **Real-time stat manipulation**  
✅ **One-click group membership**  
✅ **Test scenario triggers**  
✅ **Preset user profiles**  
✅ **Multi-user testing support**  
✅ **Complete feature coverage**  

**Perfect for testing:**
- Coach marketplace workflows
- Skip notification and snatching
- Tribe vs Squad features
- Multi-user interactions
- Real-time SSE updates
- Social features
- Progress tracking
- Gamification system

**Access:** Click the purple "Dev Controls" button in the bottom-right corner!

---

*Built with ❤️ for efficient TribeFit development*
