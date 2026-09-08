# 🔍 DEBUG: Leave Squad Issue

## 📊 Detailed Logging Added

I've added comprehensive console logging to track exactly what's happening when you try to leave.

---

## 🧪 Testing Steps

### 1. Hard Refresh Browser
```bash
Cmd + Shift + R (Mac)
Ctrl + Shift + R (Windows)
```

### 2. Open Browser Console
```bash
Right-click → Inspect → Console tab
OR
Cmd + Option + J (Mac)
F12 (Windows)
```

### 3. Try to Leave Squad
```
1. Join Alpha Squad (any user)
2. Click "Details" button
3. Click "Leave Squad" button
4. Confirm dialog
5. Watch the console for log messages
```

---

## 🔍 What to Look For in Console

You should see these logs:

### When Clicking "Leave Squad":
```
🔥 handleJoinSquad called { squadName: "Alpha Squad", isMember: true, userId: "u_alice" }
👋 Leaving squad...
📡 Calling devAddToGroup(null, null)
🔧 devAddToGroup called { userId: "u_alice", groupId: null, groupType: null }
📤 Sending to API: { userId: "u_alice", groupId: null }
📥 API Response status: 200
📥 API Response data: { success: true, user: {...}, group: null }
✅ Left group successfully
⏳ Waiting 100ms then reloading...
✅ Data reloaded
```

### If There's an Error:
Look for messages starting with:
- ❌ (indicates an error)
- The error message will tell us what's wrong

---

## 📋 Possible Issues & Solutions

### Issue 1: No logs appear
**Problem:** Function not being called
**Check:** 
- Is the modal actually open?
- Did you click the "Leave Squad" button?
- Did you confirm the dialog?

### Issue 2: "❌ No user selected"
**Problem:** effectiveUserId is null/undefined
**Solution:** 
- Open dev controls
- Select a user from dropdown
- Try again

### Issue 3: "📥 API Response status: 400"
**Problem:** API rejecting the request
**Check:** API error message in console
**Possible cause:** Server not accepting null groupId

### Issue 4: Logs show success but count reverts
**Problem:** loadInitialData() getting stale data
**Check:** 
- Does member count decrease briefly?
- Does it revert after a moment?
**Cause:** Cache or timing issue

---

## 🔧 What I Need From You

**Please copy and paste:**

1. **All console logs** from when you click "Leave Squad"
2. **Any error messages** (red text)
3. **What you see happen** (does count change? does it revert?)

**Example of what to send:**
```
Console output:
🔥 handleJoinSquad called { squadName: "Alpha Squad", isMember: true, userId: "u_alice" }
👋 Leaving squad...
❌ No userId or squadId { effectiveUserId: undefined, squadId: "..." }

What I see:
- Member count stays at 1
- No toast message appears
- Modal doesn't close
```

---

## 🚀 Quick Test Checklist

Before reporting console logs:

- ✅ Hard refresh (Cmd+Shift+R)
- ✅ Open console (Cmd+Option+J)
- ✅ Select user in dev controls
- ✅ Join a squad
- ✅ Click Details
- ✅ Click Leave Squad
- ✅ Check console output

---

## 💡 Temporary Workaround

If leaving still doesn't work, you can manually remove yourself:

```
1. Open dev controls
2. In "Groups" section
3. Select "No Group" from dropdown
4. Click update
```

---

**Send me the console output and I'll fix it!** 🔍
