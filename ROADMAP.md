# TribeFit Roadmap

## Phase 1 — Gamified consumer MVP (current)
- Tribeling avatar: skins, accessories, evolution stages (Egg → Legend), mood states (pumped / steady / deflated / couch-potato from ad-skips)
- Power-ups: Snatch, Streak Shield, TC Boost + card packs
- Squads/tribes, pacts, snitch mechanics, TC economy (Stripe top-ups)
- PWA install on phones

## Phase 2 — Engagement loops
- Daily versus card: today's tribe leaderboard with a TC pot at midnight
- Weekly card pack drop on streak milestones; cosmetic seasons
- Fun/funny interactions: emoji reactions on skips, roast notifications, squad pranks
- Single-page premium paywall (Stompers found +16% conversion vs multi-page)

## Phase 3 — Wearable & health-data integration (plan ahead)
Goal: real activity (steps, runs, workouts) feeds the Tribeling — not just gym sessions.

- **Data sources**
  - Apple Watch / iPhone: Apple HealthKit via HealthKit background delivery
  - Android / Wear OS / Pixel / Galaxy Watch: Health Connect (unified API covering Samsung/Fitbit/Garmin writes)
  - Garmin / Fitbit / Polar / Whoop: their cloud APIs (OAuth2) as secondary connectors
- **Architecture**
  - Capacitor wrapper (PWA → native shell) gives access to HealthKit/Health Connect plugins (`capacitor-health`, `@perfood/capacitor-healthkit` or custom plugin)
  - New `activity_sync` table: `{ user_id, source, type (steps|run|workout), value, started_at, ended_at }`
  - `/api/activity/sync` endpoint: clients push deltas; server dedupes on `(user_id, source, started_at)`
  - Nightly job converts activity → progress entries → streak/Tribeling state; steps count toward "physical activity" credit (e.g. 5k steps ≈ light activity day)
- **Sync semantics**: server is source of truth for streaks/TC; devices sync best-effort with conflict resolution by timestamp
- **Anti-cheat for step battles**: per-day caps, device-signed samples where available, anomaly detection on step velocity
- **Effort order**: Health Connect (covers most Android wearables) → HealthKit (Apple Watch) → Garmin/Fitbit cloud APIs

## Phase 4 — Monetization polish
- TC coin tiers ($1.99–$13.99), Super Tribeling subscription (skins, 2x card packs, streak shield auto-recharge)
- Later: B2B/enterprise group plans (deferred per current scope)
