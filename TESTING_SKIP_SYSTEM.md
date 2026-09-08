# 🧪 TESTING SKIP SYSTEM - STEP BY STEP

## 🎯 What Should Happen

When you pay to skip:
1. **Wallet deducts** correct amount (1 TC tribe, 2 TC squad)
2. **Snatched balance increases** for other tribe members (80% split)
3. **Tribe vault increases** by 20%
4. **Notifications show** correct messages with real amounts
5. **Homepage displays** snatched balance prominently

---

## 📋 Pre-Test Checklist

### **1. Hard Refresh**
```
Press: Cmd + Shift + R
(or Ctrl + Shift + R on Windows)
```

### **2. Open Browser Console**
```
Press: F12 or Cmd + Option + I
Go to Console tab
```

### **3. Check Current State**
```javascript
// In console, check your user:
console.log('Current user:', effectiveUserId);

// Check your tribe:
console.log('Current tribe:', selectedTribe);
```

---

## 🧪 Test 1: Check Initial Balances

### **Setup:**
1. Go to Home tab
2. Note your wallet balance (top right)
3. Check if snatched balance is visible (should show if > 0)

### **Expected:**
```
Wallet: XXX TC (visible)
Snatched: X.X TC (if > 0, shows in accent box below wallet)
```

### **Database Check:**
```javascript
// Open .data/db.json
// Find your user ID
// Check:
"wallet_balance_tc": 500,
"snatched_balance_tc": 0,  // Should be a number
```

---

## 🧪 Test 2: Pay to Skip (As Tribe Member)

### **Setup:**
1. Make sure you're in a tribe (check user.group_type === 'tribe')
2. Have a workout scheduled for today
3. Note current balances

### **Steps:**
1. Click "Skip" button
2. Select "Pay to Skip"
3. Watch console for logs

### **Console Output Should Show:**
```
🔥 Skipping with: {
  skipUserId: "test_xxx",
  skipTribeId: "10000000-...",
  method: "pay",
  userGroupType: "tribe"
}

✅ Skip API response: {
  success: true,
  split_results: [
    { member_id: "...", amount_received: 0.2, wallet_type: "snatched" },
    ...
  ],
  balances: {
    wallet: 499,  // Was 500, now 499 (1 TC deducted)
    pact: 20.2,   // Was 20, now 20.2 (0.2 TC added)
  },
  notifications: [...]
}
```

### **Expected Notifications:**
```
✅ "💰 2 TC split! 4 members got 0.4 TC each (snatched) 🎯"
   (or similar with your actual numbers)

✅ "💰 Split: X members got X.X TC each (snatched)"

✅ "🏛️ Tribe Vault: +0.2 TC"
```

### **Expected UI Changes:**
```
Wallet: 499 TC (decreased by 1)
Snatched: Still 0 (you're the skipper)
```

---

## 🧪 Test 3: Receive Split (As Other Member)

### **Setup:**
1. Create another user in Dev Controls
2. Add them to the same tribe
3. Switch to that user (Dev Controls)
4. Note their snatched balance

### **Steps:**
1. Switch back to first user
2. Pay to skip (1 TC)
3. Switch to second user
4. Check their snatched balance

### **Expected for Second User:**
```
Console should show (when data loads):
Snatched balance: 0.2 TC (or whatever their split was)

Homepage should show:
┌──────────────┐
│ 🎯 0.2 TC   │  ← NEW SNATCHED BOX!
│ Snatched TC │
└──────────────┘
```

### **Notification:**
```
✅ "🎁 [FirstUser] skipped! You snatched 0.2 TC! 💪"
```

---

## 🧪 Test 4: Verify Vault Update

### **Steps:**
1. Go to Tribe tab
2. Find your tribe card
3. Look for "Tribe Vault" section

### **Expected:**
```
Before skip: 20 TC
After skip:  20.2 TC  ← MUST UPDATE!
```

### **If Still Shows 0 TC:**
```
1. Check console for errors
2. Look for "✅ Data reloaded" message
3. Try manual refresh (Cmd + R)
4. Check .data/db.json for pact_balance_tc value
```

---

## 🧪 Test 5: Multiple Skips Compound

### **Steps:**
1. Pay to skip (1 TC)
2. Wait for data to load
3. Add another workout
4. Skip again (1 TC)

### **Expected Math:**
```
First skip:
- Wallet: 500 → 499
- Vault: 20 → 20.2
- Others snatched: 0 → 0.2 each

Second skip:
- Wallet: 499 → 498
- Vault: 20.2 → 20.4
- Others snatched: 0.2 → 0.4 each
```

---

## 🧪 Test 6: Spend on Next Gear

### **Steps:**
1. Go to Home tab
2. Click "Spend on Next Gear"
3. Look at bottom of modal

### **Expected:**
```
Modal should show:
"Snatched available: X • Wallet: Y"

If you have snatched TC:
Use Snatched: X.X TC
From Wallet: Y.Y TC
```

---

## 🐛 Troubleshooting

### **Issue: No snatched balance showing on homepage**

**Check:**
```javascript
// In console:
console.log('Snatched balance:', snatchedBalance);

// Should be > 0 to show the box
```

**Fix:**
1. Check if `snatchedBalance > 0` condition is true
2. Look for the accent box in DOM inspector
3. Verify CSS isn't hiding it

---

### **Issue: Vault not updating**

**Check:**
```javascript
// In console after skip:
console.log('✅ Data reloaded');  // Should see this

// Check API response:
console.log('pact_balance_tc:', data.balances.pact);
```

**Fix:**
1. Ensure `await loadInitialData()` is called
2. Check if `setPactBalance()` is updating
3. Verify tribe card is using `pactBalance` state

---

### **Issue: Wrong notifications**

**Check:**
```javascript
// Console should show:
✅ Skip API response: { notifications: [...] }

// NOT old messages like:
❌ "100 TC"
❌ "watched ads"
```

**Fix:**
1. Clear browser cache
2. Hard refresh (Cmd + Shift + R)
3. Check if old service worker is cached

---

## ✅ Success Criteria

All of these must work:

- [ ] Wallet deducts correct amount (1 TC tribe, 2 TC squad)
- [ ] Other members receive snatched TC
- [ ] Vault increases by 20%
- [ ] Notifications show correct messages
- [ ] Snatched balance visible on homepage (if > 0)
- [ ] "Spend on Next Gear" shows snatched available
- [ ] Multiple skips compound correctly
- [ ] Tribe card vault updates immediately

---

## 📊 Quick Verification Script

**Paste this in browser console after skip:**

```javascript
// Verify skip worked
const checkSkip = () => {
  console.log('=== SKIP VERIFICATION ===');
  console.log('Wallet Balance:', walletBalance);
  console.log('Snatched Balance:', snatchedBalance);
  console.log('Pact Balance:', pactBalance);
  console.log('User Group Type:', user?.group_type);
  console.log('Selected Tribe:', selectedTribe);
  
  // Expected calculations
  const expectedSkipCost = user?.group_type === 'tribe' ? 1 : 2;
  console.log('Expected skip cost:', expectedSkipCost);
  console.log('Expected vault increase:', Math.round(expectedSkipCost * 0.2 * 10) / 10);
};

checkSkip();
```

---

## 🎯 Final Test Sequence

**Complete this sequence to verify everything:**

1. **Start fresh:** Hard refresh (Cmd + Shift + R)
2. **Check state:** Open console, note balances
3. **Pay to skip:** Click skip, select "Pay"
4. **Watch console:** Look for logs
5. **Verify notifications:** Should see correct messages
6. **Check homepage:** Wallet decreased, snatched visible (if you received split)
7. **Check tribe card:** Vault increased
8. **Verify persistence:** Refresh page, balances should stay

**If all 8 steps work → System is working! ✅**
**If any fail → Check troubleshooting section above**

---

## 🔥 Common Mistakes

1. **Not using effectiveUserId**
   - Make sure Dev Controls user is passed correctly

2. **Wrong tribe selected**
   - Verify `selectedTribe` matches your actual tribe

3. **Not waiting for reload**
   - `loadInitialData()` is async, give it time

4. **Old cached data**
   - Always hard refresh after code changes

5. **Looking at wrong balance**
   - Snatched and wallet are different!

---

## 💡 Pro Tips

1. **Use Dev Controls** to create multiple users and test splits
2. **Open two browser tabs** to see real-time updates
3. **Watch the console** - logging will show you exactly what's happening
4. **Check .data/db.json** to verify database is updating
5. **Test with different group types** (tribe vs squad)

---

**Ready to test? Start with Test 1 and work through sequentially!** 🚀
