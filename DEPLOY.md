# Deploying TribeFit

The app is deploy-ready for both **Vercel** and **Docker/self-hosted**.

- On **Vercel** it uses the standard Next.js output (`next build`).
- On **Coolify/Railway/Docker** it uses `output: 'standalone'` automatically (controlled by `process.env.VERCEL` in `next.config.js`).

For real users, auth, and multi-device sync you need **Supabase**.

---

## Recommended: Vercel + Supabase

This is the fastest, zero-ops path.

### 1. Push to GitHub

Make sure the repo is clean and pushed:

```bash
git add .
git commit -m "Prepare for Vercel + Supabase deploy"
git push origin main
```

Files already configured:

- `next.config.js` automatically disables `output: 'standalone'` on Vercel.
- `.gitignore` excludes `.next`, `.data`, `package-lock.json`, etc.
- `packageManager` is set to `yarn@1.22.22`.

### 2. Create a Vercel project

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. Vercel should auto-detect **Next.js**.
3. Build settings are automatic:
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `yarn install`
4. Add the environment variables below.
5. Deploy.

### 3. Environment variables (Vercel → Project → Settings → Environment Variables)

| Var | Needed for |
|---|---|
| `SUPABASE_URL` | Real database + auth mode |
| `SUPABASE_ANON_KEY` | Client-side Supabase queries |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin writes |
| `NEXT_PUBLIC_BASE_URL` | Your Vercel domain |
| `OPENROUTER_API_KEY` | AI coach features (optional) |
| `STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` | Real payments (optional) |

> Without `SUPABASE_URL` the app falls back to mock/file-DB mode. **On Vercel the filesystem is read-only for serverless functions**, so mock mode will not persist across requests. Use Supabase for production.

### 4. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to Project Settings → API and copy:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. In the Supabase SQL editor, run `supabase-schema.sql`, then `supabase-schema-squads.sql`.
4. Add the three env vars to Vercel and redeploy.
5. Wire the app’s auth/login flow to Supabase Auth and migrate `app/api/_store/db.js` from the file store to Supabase tables. The schema exists; the adapter is the remaining work.

---

## About that Vercel storage warning

Your usage is normal for an active project, but **Deployment Storage is 29.7 GB**. On the Hobby plan Vercel includes **10 GB** of deployment storage, so that is what triggered the “approaching limit” email.

What to do before/after deploying:

1. **Shorten your Deployment Retention Policy**
   - Vercel dashboard → Project → Settings → Deployment Retention Policy
   - Production: 30 days (or less)
   - Preview: 7 days (or less)
   - Canceled / errored: 1 day
2. **Delete old preview deployments** manually from the Deployments tab.
3. **Avoid `output: 'standalone'` on Vercel**. This is already handled in `next.config.js` (`output` is only `standalone` when `VERCEL` is not set). Standalone output increases deployment size because it bundles `node_modules` separately.

After those steps your deployment storage should drop well under the free limit.

---

## Alternative: Coolify + Supabase (self-hosted)

If Vercel becomes too expensive at scale, Coolify on a cheap VPS is a good escape hatch.

1. Provision a VPS (Hetzner CX21 / Contabo).
2. Install Coolify:
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
3. Add the repo as a Dockerfile resource.
4. Add the same env vars as above.
5. For mock mode, mount a volume at `/app/.data`.

---

## Alternative: Railway

Still works, but you mentioned it is expensive at scale.

1. Push to GitHub.
2. Railway → New Project → Deploy from GitHub repo.
3. Add the env vars above.
4. If running in mock mode, attach a volume at `/app/.data`.

---

## Summary

| Setup | Best for | Supabase required? |
|---|---|---|
| **Vercel + Supabase** | Quick launch, automatic scaling | Yes for real data |
| **Coolify + Supabase** | Cheaper compute, more control | Yes for real data |
| **Vercel/Coolify, file DB only** | Quick demos | No, but data is ephemeral on Vercel |

**Bottom line**: go with **Vercel + free Supabase hobby**. The storage warning is fixable by cleaning up old deployments and using the standard Next.js output.
