# Deploying TribeFit

## Railway (recommended)

The app is already deploy-ready: `Dockerfile` + `output: 'standalone'` in `next.config.mjs`.

**Option A — GitHub (easiest):**
1. Push this repo to GitHub.
2. Railway → New Project → Deploy from GitHub repo → pick the repo.
3. Railway detects the Dockerfile automatically and deploys.

**Option B — CLI:**
```bash
npm i -g @railway/cli
railway login
railway init   # link/create project
railway up     # builds the Dockerfile
```

**Set a public domain:** Railway dashboard → your service → Settings → Networking → Generate Domain. Your app is live at `https://<name>.up.railway.app`.

## Environment variables (Railway → Variables)

| Var | Needed for |
|---|---|
| `SUPABASE_URL` | Real database mode |
| `SUPABASE_ANON_KEY` | Real database mode |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin writes |
| `OPENROUTER_API_KEY` | AI coach features (optional) |
| `STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` | Real payments (optional) |
| `NEXT_PUBLIC_BASE_URL` | Your Railway domain |

## ⚠️ Important: data persistence

The gamification data (avatars, items, groups, wallets, progress) currently lives in a **file-backed store** at `.data/db.json`. Railway's filesystem is **ephemeral** — it resets on every redeploy unless you attach a **Volume**:

- Railway → your service → Settings → Volumes → Mount path: `/app/.data`

With a volume, mock-mode data survives redeploys and the app works end-to-end today.

## Do you still need Supabase?

- **Not to deploy/demo** — without `SUPABASE_URL`, the app runs in mock mode on the file store (add the volume above).
- **Yes for production** — real auth, multi-device sync, real users all need a real database.

### Setting up Supabase when you're ready

1. Create a project at supabase.com → get `SUPABASE_URL` + `anon` + `service_role` keys (Settings → API).
2. In the Supabase SQL editor, run `supabase-schema.sql`, then `supabase-schema-squads.sql`.
3. Add the three env vars to Railway → the app auto-switches out of mock mode.
4. Note: real auth wiring (Supabase Auth ↔ the app's login screen) and migrating the gamification store from the file DB to Supabase tables are follow-up work — the schema exists but the store layer still needs the adapter.
