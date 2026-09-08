# Environment Variables Setup

This file explains which environment variables you need to configure for TribeFit's advanced features.

## 📋 Required API Keys and Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# ==============================================
# GOOGLE CALENDAR INTEGRATION
# ==============================================
# Get these from: https://console.cloud.google.com/
# 1. Create a new project
# 2. Enable Google Calendar API
# 3. Create OAuth 2.0 credentials
# 4. Add authorized redirect URI: http://localhost:3000/api/calendar/google/callback

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/google/callback

# ==============================================
# GOOGLE CLOUD VISION (Photo OCR)
# ==============================================
# Get from: https://console.cloud.google.com/
# 1. Enable Cloud Vision API
# 2. Create API key credentials

GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key_here

# ==============================================
# AWS TEXTRACT (Alternative Photo OCR)
# ==============================================
# Get from: https://console.aws.amazon.com/
# Optional - Only if you prefer AWS over Google Cloud Vision

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# ==============================================
# DATABASE (Future Implementation)
# ==============================================
# Currently using in-memory storage
# Replace with your database when scaling

DATABASE_URL=postgresql://user:password@localhost:5432/tribefit
# or
MONGODB_URI=mongodb://localhost:27017/tribefit

```

## 🚀 Setup Instructions

### 1. Google Calendar API

**Step 1:** Go to [Google Cloud Console](https://console.cloud.google.com/)

**Step 2:** Create a new project or select existing
- Click "Select a project" → "New Project"
- Name: "TribeFit Calendar Integration"
- Click "Create"

**Step 3:** Enable Google Calendar API
- Go to "APIs & Services" → "Library"
- Search for "Google Calendar API"
- Click "Enable"

**Step 4:** Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth client ID"
- Application type: "Web application"
- Name: "TribeFit Web Client"
- Authorized redirect URIs: Add `http://localhost:3000/api/calendar/google/callback`
- Click "Create"

**Step 5:** Copy credentials
- Copy the Client ID and Client Secret
- Paste into `.env.local`

**Production:** For production, also add:
- `https://yourdomain.com/api/calendar/google/callback`

---

### 2. Google Cloud Vision API (Photo OCR)

**Step 1:** In the same Google Cloud project

**Step 2:** Enable Cloud Vision API
- Go to "APIs & Services" → "Library"
- Search for "Cloud Vision API"
- Click "Enable"

**Step 3:** Create API Key
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "API key"
- Copy the API key
- Paste into `.env.local` as `GOOGLE_CLOUD_VISION_API_KEY`

**Optional:** Restrict the API key
- Click "Edit API key"
- Under "API restrictions", select "Cloud Vision API"
- Save

---

### 3. Apple Calendar (.ics files)

**No API key required!** Apple Calendar import works by:
- Exporting .ics files from Apple Calendar
- Uploading them to the app
- The app parses them server-side

**How to export from Apple Calendar:**
1. Open Calendar app on Mac
2. Select the calendar you want to export
3. File → Export → Export...
4. Save as .ics file
5. Upload to TribeFit

---

## 🔄 Fallback Behavior

**All integrations have fallbacks:**

✅ **Google Calendar** - Shows sample workouts if API not configured
✅ **Photo OCR** - Returns example extracted workout if Vision API not configured  
✅ **Apple Calendar** - Parses .ics files without any API (always works)

**You can use the app immediately without any API keys!**

The app will:
- Show warning toasts when using fallback data
- Display "Using sample data" messages
- Still provide full functionality with mock data

---

## 🗄️ Database Migration (Future)

**Currently:** Workouts are stored in-memory (cleared on server restart)

**To persist data:**

### Option 1: PostgreSQL (Recommended)
```bash
# Install PostgreSQL
brew install postgresql

# Create database
createdb tribefit

# Add to .env.local
DATABASE_URL=postgresql://localhost:5432/tribefit
```

### Option 2: MongoDB
```bash
# Install MongoDB
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Add to .env.local
MONGODB_URI=mongodb://localhost:27017/tribefit
```

### Option 3: Supabase (Easiest for production)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy database URL
4. Paste into `.env.local`

---

## 🧪 Testing

After adding credentials, test each integration:

### Test Google Calendar:
```bash
# In browser console:
// Click "Import" → "Google Calendar"
// Should open OAuth window
```

### Test Photo OCR:
```bash
# Upload a photo with workout text
# Should extract exercises automatically
```

### Test Apple Calendar:
```bash
# Export .ics from Apple Calendar
# Upload to TribeFit
# Should parse all events
```

---

## 🔐 Security Notes

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate keys** if accidentally exposed
3. **Use different keys** for dev/production
4. **Restrict API keys** to specific APIs
5. **Monitor usage** in Google Cloud Console

---

## 📞 Troubleshooting

**Google Calendar not importing?**
- Check OAuth redirect URI matches exactly
- Verify Calendar API is enabled
- Check browser console for errors

**Photo OCR not working?**
- Verify Vision API is enabled
- Check API key is correct
- Ensure image is clear and readable

**Database connection failing?**
- Verify database is running
- Check connection string format
- Test connection with `psql` or `mongosh`

---

## 💡 Cost Estimates

All Google Cloud APIs have free tiers:

- **Calendar API**: Free (10,000 requests/day)
- **Cloud Vision**: Free (1,000 images/month)
- After free tier: ~$1.50 per 1,000 images

**For most users, it's completely free!**

---

## 🎯 Next Steps

1. Create `.env.local` file
2. Add Google Calendar credentials (if you want real calendar import)
3. Add Vision API key (if you want photo OCR)
4. Restart development server: `npm run dev`
5. Test each integration

**Optional:** Keep using fallback data if you don't need real APIs yet!
