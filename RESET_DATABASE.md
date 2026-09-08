# 🔄 Reset Database to Clean State

## The Issue

You're seeing **23 members** because the database has persisted data from previous testing sessions.

---

## ✅ Quick Fix - Delete Persisted Database

**Option 1: Delete the database file**

```bash
# Find and delete the persisted database
rm -f /tmp/tribefit_db.json

# Or if stored in project:
rm -f .tribefit_db.json
rm -f db.json
```

**Then restart the app:**
```bash
# Ctrl+C to stop
npm run dev
```

**Result:** Fresh database with only 3 seed users (Alice, Bob, Carol)

---

## ✅ Better Solution - Reset Command

Let me add a reset button to dev controls...

Actually, the easiest way is to **delete the database file** as shown above.

---

## 🎯 After Reset

**You'll see:**
- Members: 3 (Alice, Bob, Carol)
- Default Tribe with 3 members
- Fire Squad with 0 members
- Founders Tribe with 0 members

**Then you can:**
1. Create new users via dev controls
2. Join different squads
3. Test member count increasing from real joins

---

## 📝 Understanding the Database

**Initial Seed (lines 60-72 in db.js):**
```javascript
['u_alice', 'u_bob', 'u_carol'].forEach((uid, i) => {
  globalThis.__DB__.users[uid] = {
    id: uid,
    name: uid.replace('u_', '').replace(/\b\w/g, c => c.toUpperCase()),
    // ... more fields
  };
});
```

**This creates 3 users on first run.**

**When you create more users via dev controls, they persist to the file.**

**That's why you see 23 - you've created 20 more users in previous testing!**

---

## 🎮 Fresh Start Testing

**1. Delete database:**
```bash
rm -f /tmp/tribefit_db.json
```

**2. Restart app:**
```bash
npm run dev
```

**3. Check member count:**
- Should show 3 (Alice, Bob, Carol)

**4. Create new users:**
- Open dev controls
- Create "David"
- Member count: 4 ✓

**5. Multi-tab testing:**
- Tab 1: Set User ID: u_emily
- Tab 2: Set User ID: u_frank
- Both join Fire Squad
- Member count increases: 0 → 1 → 2 ✓

---

**The 23 is from your previous testing sessions!** 🎯  
**Just delete the database file to start fresh.** ✨
