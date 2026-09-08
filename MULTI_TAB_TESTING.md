# 🌐 Multi-Tab Testing Guide

**Setup for Real Squad Evolution Testing**

---

## ✅ WHAT WAS CHANGED

### 1. Removed Redundant Tribe Section ✓
**Before:** Separate "Squads" and "Tribes" sections  
**After:** Only Squads section (they evolve into Tribes!)

**Why:** Tribes are just evolved Squads. No need for duplicate UI.

---

### 2. Made All Stats Dynamic ✓
**Before:** Hardcoded values (28 streak, 15 members, etc.)  
**After:** Real data from actual users

**Stats Now Show:**
- **Vault TC:** Real pactBalance value
- **Day Streak:** Current user's actual streak
- **Members:** Actual testUsers count

---

### 3. Tribe Vault Shows Real Data ✓
**Before:**
```
👥 Active Members: 23  (fake)
```

**After:**
```
👥 Active Members: 0  (starts at 0, increases as you add users!)
```

---

## 🎮 HOW TO TEST MULTI-TAB

### Setup (5 minutes)

**1. Open Multiple Tabs:**
```bash
# Tab 1: http://localhost:3000
# Tab 2: http://localhost:3000
# Tab 3: http://localhost:3000
```

**2. In Each Tab, Set Different User:**

**Tab 1 (Top dev controls):**
```
User ID: u_alice
User Name: Alice
Group ID: squad_test_1
```

**Tab 2 (Top dev controls):**
```
User ID: u_bob
User Name: Bob
Group ID: squad_test_1
```

**Tab 3 (Top dev controls):**
```
User ID: u_carol
User Name: Carol
Group ID: squad_test_1
```

---

## 📊 TESTING SCENARIOS

### Test 1: Squad Creation & Member Growth

**In Tab 1 (Alice):**
1. Go to Tribe tab
2. Click "Create Squad"
3. Name: "Alpha Fitness"
4. Create squad

**In Tab 2 (Bob):**
1. Refresh or click Tribe tab
2. See "Alpha Fitness" squad
3. Click "Join Squad"
4. **Check:** Members count increases to 2! ✓

**In Tab 3 (Carol):**
1. Join "Alpha Fitness"
2. **Check:** Members count now 3! ✓

**Result:** Member count updates dynamically!

---

### Test 2: Streaks & Stats

**In Tab 1 (Alice):**
1. Open dev controls (purple button)
2. Click "+14 Streak"
3. **Check:** Top header shows "14 days" ✓

**In Tab 2 (Bob):**
1. Adjust streak to 7 days
2. **Check:** Header updates ✓

**In Tab 3 (Carol):**
1. Set streak to 30 days
2. **Check:** Squad qualifies for tribe upgrade! ✓

**Result:** Each user has independent stats!

---

### Test 3: Vault Balance

**In Tab 1 (Alice):**
1. Skip workout (paid)
2. **Check:** Vault TC increases by 20% of cost ✓

**All Tabs:**
1. Refresh
2. **Check:** All see updated vault balance ✓

**Result:** Vault is shared across squad!

---

### Test 4: Squad Evolution

**Requirements:**
- 30-day streak (any member)
- 5+ members
- Squad active for 7+ days

**To Test:**
1. Use dev controls to set streak to 30 (one user)
2. Add 5 users to squad
3. **Check:** "Upgrade to Tribe" button appears ✓
4. Click upgrade
5. **Check:** Squad becomes Tribe! ✓
6. **Check:** Tribe features unlock (voting, etc.) ✓

---

## 🎯 WHAT YOU'LL SEE NOW

### Squad Header (Dynamic)
```
Squads & Tribes
X squads • Y tribes    ← Real counts!

Vault TC: Z           ← Real vault balance
Day Streak: N         ← Current user's streak
Members: M            ← Actual member count
```

### Tribe Vault Info (Dynamic)
```
Tribe Vault
Z TC                  ← Real balance
Community Fund

💰 Skip Mode: Teammate Boost (80/20)
👥 Active Members: M   ← Real count from testUsers
🏛️ Vault Usage: Community gear & donations
```

---

## 🚀 MULTI-USER TESTING FLOW

### Step-by-Step Real Testing

**1. Create Base Squad (Tab 1):**
```
- User: Alice
- Action: Create "Test Squad"
- Stats: 0 members, 0 streak, 0 vault
```

**2. Add Members (Tabs 2-5):**
```
- Tab 2 (Bob): Join squad → Members: 2
- Tab 3 (Carol): Join squad → Members: 3
- Tab 4 (David): Join squad → Members: 4
- Tab 5 (Emily): Join squad → Members: 5
```

**3. Build Streaks:**
```
Each tab:
- Open dev controls
- Set different streaks (5, 7, 14, 30, 60)
- See individual progress
```

**4. Test Squad Features:**
```
- Skip workouts (paid/ad)
- Watch vault grow
- Test notifications
- Try coach marketplace
```

**5. Reach Evolution:**
```
When ready:
- One user hits 30-day streak
- 5+ members joined
- Click "Upgrade to Tribe"
- Unlock tribe features!
```

---

## 📝 WHAT'S NOW DYNAMIC

### ✅ Always Real Data:
- Member count
- User streak
- Vault balance
- Snatched TC
- Workout count
- Progress stats
- Squad/tribe list

### ✅ Updates Across Tabs:
- Join/leave squad
- Skip notifications
- Vault changes
- Vote results
- Member additions

### ✅ Independent Per Tab:
- Current user
- User stats (streak, workouts)
- Wallet balance
- Snatched balance
- Profile info

---

## 💡 TESTING TIPS

### For Squad Growth:
```
1. Open 5+ tabs
2. Create 5+ different users
3. All join same squad
4. Watch member count climb!
```

### For Evolution Testing:
```
1. One tab: Set streak to 30+
2. Other tabs: Join to reach 5 members
3. Click upgrade button
4. Verify tribe features unlock
```

### For Economy Testing:
```
1. Tab 1: Skip workout (paid)
2. Tabs 2-5: Receive snatched TC
3. All: See vault increase
4. Verify 80/20 split working
```

### For Real-Time Updates:
```
1. Tab 1: Make change (join, skip, etc.)
2. Tab 2: Refresh or wait for SSE
3. Verify change reflected
4. Test notifications appear
```

---

## 🎊 NOW YOU CAN TEST

**Everything is dynamic and real!**

✅ No fake data  
✅ Real member counts  
✅ Actual user stats  
✅ True squad evolution  
✅ Multi-tab synchronization  

**Result:** Test the actual user experience your users will have! 🚀

---

## 🔧 QUICK TESTING COMMANDS

```bash
# Terminal 1: Start app
npm run dev

# Open tabs:
Tab 1: http://localhost:3000 (Alice)
Tab 2: http://localhost:3000 (Bob)
Tab 3: http://localhost:3000 (Carol)

# In each tab:
1. Set User ID in top dev controls
2. Join same squad
3. Adjust stats with purple dev controls
4. Watch everything update in real-time!
```

---

**🎉 Ready for real multi-user testing!**
