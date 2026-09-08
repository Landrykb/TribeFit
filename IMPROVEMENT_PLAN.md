# TribeFit — Improvement Plan

## 1. AI: OpenRouter free models
- [ ] Migrate `lib/ai-service.js` to OpenRouter (`https://openrouter.ai/api/v1`), key via `OPENROUTER_API_KEY` (user adds to `.env`), fallback to `EMERGENT_LLM_KEY`.
- [ ] Default free model chain: `meta-llama/llama-3.3-70b-instruct:free` → `google/gemini-2.0-flash-exp:free` → `deepseek/deepseek-r1-0528:free` (auto-fallback on 429/404).
- [ ] Update "generated_by" labels.

## 2. Redesign (Hick's Law — fewer choices per screen, clear hierarchy)
- [ ] New color system: energetic palette (electric lime/violet accent on deep charcoal) via CSS variables + Tailwind tokens in `tailwind.config.js`; keep light mode support.
- [ ] Typography: keep Inter, tighten scale, stronger headings.
- [ ] Icons: standardize on `lucide-react` everywhere (already installed); replace emoji/inconsistent glyphs.
- [ ] Hick's Law pass: max ~5 primary nav items, one primary CTA per section, collapse secondary actions into menus, progressive disclosure in settings.
- [ ] Skeleton loading components (`components/ui/skeleton.jsx`) for feed, tribe, progress, profile, coach sections.
- [ ] Mobile responsiveness: audit all sections at 360–430px, fix overflows, bottom nav, safe-area padding, touch targets ≥44px.

## 3. Stompers.com-inspired gamification
Research summary: Stompers = create-a-character avatar, daily step battles vs friends, items/power-ups to "whack" rivals' progress, card packs, cosmetics, coins IAP ($1.99–$13.99), "Super Stompers" sub ($4.99/wk–$59.99/yr), enterprise bulk plans, single-page paywall (+16% conversion).

Adapted for TribeFit:
- [ ] **Avatar "Tribeling"**: customizable character tied to ProfileCustomization; visual state reflects streak/progress.
- [ ] **Power-ups & items**: earn/buy with existing TC currency — e.g. "Snatch" (reduce a rival's daily progress %, mirrors their whack mechanic — fits existing "snatched" balance concept), "Shield" (protect streak), "Boost" (2x TC on next workout).
- [ ] **Card packs**: randomized item drops purchasable with TC; daily free pack on streak.
- [ ] **Daily versus**: daily tribe/squad leaderboard with countdown; winner takes a TC pot.
- [ ] **Progress decay**: missing a workout visibly "deflates" your avatar/progress bar (already have skip system — surface it visually).
- [ ] **Widget/glanceable standing**: compact standings card on Home tab.
- [ ] **Paywall**: single-page premium pitch (Stripe already integrated) — monthly vs yearly, yearly highlighted.

## 4. Bug fixes
- [ ] Apply findings from code audit (see audit report when done).
- [ ] Remove/complete "coming soon" stubs (calendar import, photo import, QR code).
- [ ] Verify `next build` passes clean.

## 5. Mobile packaging
- [ ] PWA: manifest.json, icons, theme-color, service worker for offline shell → installable on phones.
- [ ] Later: Capacitor wrapper for app-store distribution.

## Execution order
1. OpenRouter switch (quick win)
2. Design tokens + globals.css + tailwind config
3. Skeleton components + loading states
4. Mobile responsive pass on page.js + components
5. Icon cleanup (Lucide)
6. Bug fixes from audit
7. Gamification: items/power-ups → card packs → daily versus → avatar states → paywall
8. PWA manifest + mobile preview on LAN

## Status update (round 2)
- [x] Avatar system: skins (6), accessories (5), evolution stages (Egg→Legend with perks), couch-potato state from ad-skips — `app/api/avatar`, `components/Tribeling.jsx`, `components/AvatarStudio.jsx`
- [x] AI is OpenRouter-only now; disabled gracefully without OPENROUTER_API_KEY
- [x] Beast-stage perk wired into skip fees (-1 TC)
- [x] Cartoon animations: wiggle, squash, confetti-pop, card-toon style
- [x] Wearables roadmap → ROADMAP.md
- Note: dev-mode UI is already hidden behind 5-tap logo; the /api/dev store is the app's data backend, so it stays (invisible to users)
