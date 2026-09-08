# 🌐 Remote Testing Setup Guide

**Share TribeFit with friends anywhere in the world - in 5 minutes!**

---

## 🎯 Quick Start (Recommended: ngrok)

### Step 1: Install ngrok

```bash
# macOS (with Homebrew)
brew install ngrok

# Alternative: Download from https://ngrok.com/download
```

### Step 2: Start Your App

```bash
# In your TribeFit project directory
npm run dev

# Wait for: "✓ Ready on http://localhost:3000"
```

### Step 3: Create Public Tunnel

Open a **NEW terminal** (keep the first one running!) and run:

```bash
ngrok http 3000
```

You'll see output like:
```
Session Status                online
Account                       Free account
Forwarding                    https://abc-123-xyz.ngrok.app -> http://localhost:3000

Web Interface                 http://127.0.0.1:4040
```

### Step 4: Share the URL

**Copy the `https://` URL** (e.g., `https://abc-123-xyz.ngrok.app`) and send it to your friends!

They can now:
- ✅ Visit the URL from anywhere
- ✅ Test all features
- ✅ Create accounts with dev controls
- ✅ Test multi-user interactions

---

## 📱 Testing Multi-User Scenarios

### Setup for 2-3 Friends Testing Together

**Friend 1 (You):**
```bash
# Terminal 1: Your app
npm run dev

# Terminal 2: ngrok tunnel
ngrok http 3000

# Visit: https://your-url.ngrok.app
# Use dev controls at top to set:
# - User ID: u_alice
# - User Name: Alice
```

**Friend 2:**
```bash
# Visit: https://your-url.ngrok.app
# Use dev controls at top to set:
# - User ID: u_bob
# - User Name: Bob
```

**Friend 3:**
```bash
# Visit: https://your-url.ngrok.app
# Use dev controls at top to set:
# - User ID: u_carol
# - User Name: Carol
```

**Now test together!**
- All join the same tribe
- One person skips workout
- Others see real-time notification via SSE
- Test coach hiring, tipping, etc.

---

## 🔧 Advanced: ngrok with Custom Domain (Optional)

### Free Account Features
- ✅ 1 online tunnel
- ✅ 40 connections/minute
- ✅ HTTPS enabled
- ❌ URL changes each time

### Paid Account Benefits ($8/month)
- ✅ Custom subdomain (e.g., `tribefit.ngrok.app`)
- ✅ Reserved domain
- ✅ More concurrent connections
- ✅ URL stays the same

**Setup with custom domain:**
```bash
# Sign up at ngrok.com, get auth token
ngrok config add-authtoken YOUR_TOKEN

# Use custom subdomain
ngrok http 3000 --subdomain=tribefit
# Now always: https://tribefit.ngrok.app
```

---

## 🚀 Alternative: Deploy to Vercel (Best for Long-term)

### Why Vercel?
- ✅ Free for hobby projects
- ✅ Permanent URL
- ✅ Auto-deploy on git push
- ✅ No session limits
- ✅ Production-ready

### Setup (10 minutes)

**1. Create Vercel Account**
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub

**2. Install Vercel CLI**
```bash
npm install -g vercel
```

**3. Deploy**
```bash
# From your project directory
vercel

# Follow prompts:
# - Setup and deploy? Yes
# - Which scope? Your username
# - Link to existing project? No
# - Project name? tribefit (or any name)
# - Directory? ./
# - Override settings? No

# Wait for deployment...
# Get URL: https://tribefit-abc123.vercel.app
```

**4. Share URL**
Send the Vercel URL to friends - it's permanent!

**5. Auto-deploy Updates**
```bash
# After making changes
git add .
git commit -m "Update features"
git push origin main

# Vercel auto-deploys! Friends see updates automatically.
```

---

## 🔒 Alternative: Tailscale (Private Network)

### For Very Private Testing

**Why Tailscale?**
- ✅ Create private VPN between devices
- ✅ Very secure (end-to-end encrypted)
- ✅ No public URLs
- ✅ Free for personal use

**Setup:**

**1. Install Tailscale**
- You: Install from [tailscale.com](https://tailscale.com/download)
- Friends: Also install Tailscale

**2. Everyone Join Same Network**
- Sign in with Google/GitHub/email
- Accept connection on dashboard

**3. Share Your Tailscale IP**
```bash
# Find your Tailscale IP
tailscale ip

# Example output: 100.101.102.103

# Start app
npm run dev

# Share with friends: http://100.101.102.103:3000
```

**Pros:** Very secure, no public exposure  
**Cons:** Everyone needs Tailscale installed

---

## 🌍 Alternative: LocalTunnel (Free, No Account)

### Quick Testing, No Signup

**Install:**
```bash
npm install -g localtunnel
```

**Use:**
```bash
# Terminal 1: Start app
npm run dev

# Terminal 2: Create tunnel
lt --port 3000

# Get URL like: https://funny-shark-12.loca.lt
```

**First-time visitors see:**
- Password screen (click "Submit" or share the IP it shows)
- Then they access your app

**Pros:** No account needed  
**Cons:** Less reliable, password screen on first visit

---

## 🎮 Testing Checklist for Remote Friends

### Basic Features
- [ ] Sign up / Login
- [ ] Create test user via dev controls
- [ ] Join a tribe or squad
- [ ] View home page stats
- [ ] Toggle dark/light mode

### Social Features
- [ ] Post to feed
- [ ] React to posts
- [ ] Send tips to other users
- [ ] View notifications

### Tribe Features
- [ ] View tribe members
- [ ] See tribe vault balance
- [ ] Vote on proposals
- [ ] View leaderboard

### Coach Marketplace
- [ ] Browse coaches
- [ ] Apply to become coach (if eligible)
- [ ] Hire a coach
- [ ] Rate a coach

### Workout Features
- [ ] Generate AI workout
- [ ] Start workout session
- [ ] Complete workout
- [ ] View progress history

### Multi-User Testing
- [ ] Two users in same tribe
- [ ] One skips workout (paid skip)
- [ ] Other receives snatched TC notification
- [ ] Both see real-time updates

---

## 🐛 Troubleshooting

### "Site can't be reached"
**Check:**
- Your app is running (`npm run dev`)
- ngrok is running in separate terminal
- You copied the HTTPS URL (not HTTP)

**Fix:**
```bash
# Restart ngrok
# Press Ctrl+C to stop
ngrok http 3000
# Copy new URL
```

### "Too many connections" (ngrok free)
**Cause:** Free tier limit (40/minute)

**Fix:**
- Wait 1 minute
- OR upgrade to paid plan
- OR use Vercel instead

### Friends see "Invalid Date"
**Cause:** Notification bug (already fixed!)

**Fix:**
- Latest code has the fix
- Refresh the page

### Dev controls don't show
**Check:**
- App is in development mode
- Look for purple button bottom-right
- Not hidden behind other elements

**Fix:**
```bash
# Make sure you're running dev mode
npm run dev
# (not npm run build or npm start)
```

### Real-time notifications don't work
**Check:**
- SSE endpoint is accessible
- Both users in same tribe/group
- Browser allows SSE connections

**Fix:**
- Check browser console for errors
- Try refreshing page
- Verify group membership

---

## 📊 Performance Tips

### For Smooth Testing

**1. Limit Concurrent Users (ngrok free)**
- Max 3-5 testers at once
- More? Use Vercel

**2. Test Core Features First**
- Basic navigation
- User creation
- Group joining
- Then advanced features

**3. Clear Instructions for Testers**
```
Hi! Here's how to test TribeFit:

1. Visit: https://your-url.ngrok.app
2. Look for "Dev Controls" at top
3. Set your User ID: u_your_name
4. Set your Name: Your Name
5. Click "Join Default Tribe"
6. Now explore the app!

Test ideas:
- Try becoming a coach
- Post something to feed
- Skip a workout (paid skip)
- See if others get notification
```

---

## 🎯 Recommendations by Use Case

### Quick Demo (1-2 hours)
**→ Use ngrok**
- Fastest setup
- No account needed
- Good for 2-5 friends

### Testing Session (1 day)
**→ Use ngrok with auth token**
- More stable
- Custom subdomain
- Better for organized testing

### Week-long Testing
**→ Deploy to Vercel**
- Permanent URL
- No session management
- Professional setup
- Can share with more people

### Private Beta (Ongoing)
**→ Vercel + Custom Domain**
- Buy domain ($12/year)
- Connect to Vercel
- Professional URL
- Production-ready

---

## 📝 Quick Command Reference

```bash
# ==== ngrok ====
# Start tunnel
ngrok http 3000

# With custom subdomain (paid)
ngrok http 3000 --subdomain=tribefit

# With auth token
ngrok config add-authtoken YOUR_TOKEN


# ==== Vercel ====
# Deploy
vercel

# Deploy to production
vercel --prod

# Check deployments
vercel ls


# ==== LocalTunnel ====
# Start tunnel
lt --port 3000

# With custom subdomain
lt --port 3000 --subdomain tribefit


# ==== Tailscale ====
# Get your IP
tailscale ip

# Check status
tailscale status
```

---

## 🎊 Success!

You're now ready to share TribeFit with friends anywhere! 🚀

**Remember:**
- Start your app first (`npm run dev`)
- Then start tunnel (ngrok/etc.)
- Share the HTTPS URL
- Friends use dev controls to create users
- Test together and have fun!

**Need help?** Check the troubleshooting section or ask in the dev Discord!

---

*Happy Testing! 🎉*
