# ภาษาไทย Thai App — Commercial Launch Audit
*Audited: July 2026 · Scope: full codebase, backend (Supabase), payments (Stripe), deploy pipeline*

**Verdict: NOT ready for commercial launch yet.** The learning product itself is solid
(2,013-word database, SRS engine, writing trainer, reader, leaderboard — all working,
typechecked, deployed). What blocks a paid launch is the *commercial layer*: payment
entitlement, legal compliance, and abuse resistance. All fixable in ~2–3 weeks.

Current status: **Premium is ON HOLD** (`constants/features.ts → PREMIUM_ON_HOLD = true`).
Everyone gets full access while testing. Flip to `false` to restore the paywall.

---

## 🔴 CRITICAL — must fix before charging money

### C1. Payment entitlement is client-side and trivially bypassable
- Visiting `https://…/thaiapp/?payment_success=1` unlocks Premium — no verification.
- Premium is a localStorage flag (`@thaiapp_premium`); anyone can set it in DevTools.
- It's a **monthly subscription**, but the app can never re-lock: cancellations,
  failed renewals and refunds have no effect.
- Purchase is device-local: clear browser data or switch devices → paid customer
  loses access (refund/support nightmare). No "restore purchase" possible.
- Stripe has no idea *which user* paid — no customer ↔ account link.

**Fix (the right way):** entitlements in Supabase.
1. Require a signed-in Supabase user before purchase (anonymous → email upgrade is fine).
2. Create the Stripe Checkout session server-side (Supabase Edge Function) with
   `client_reference_id = auth user id`.
3. Stripe **webhook** (`checkout.session.completed`, `customer.subscription.deleted`,
   `invoice.payment_failed`) → Edge Function → upsert an `entitlements` table.
4. App reads `isPremium` from the entitlements row (RLS: owner-read), cached locally.
   Alternative: RevenueCat (~free at this scale) if going to app stores — it handles all of this.

### C2. No legal / compliance layer
- No Privacy Policy, Terms of Service, or refund/cancellation policy. These are
  **required by Stripe**, by GDPR (EU users), and by Thailand's PDPA. The app collects
  personal data (usernames, bios, country flags) into Supabase.
- Subscriptions legally require a discoverable cancel path — none exists in-app.

**Fix:** static Privacy/Terms/Refund pages (can live on the same GitHub Pages site),
linked from the Premium modal and profile; a "Manage subscription" link to the Stripe
customer portal; a data-deletion contact/flow (PDPA/GDPR right to erasure).

### C3. Leaderboard/backend integrity — cheating and abuse are trivial
- `scores` RLS lets the owner write **any values**: `xp: 999999999` from the browser
  console puts anyone at #1 on a public leaderboard of a paid product.
- Anonymous sign-in + no rate limiting → unlimited fake profiles.
- Username/display/bio limits exist **only client-side** (`maxLength`); the DB accepts
  any length or content via direct API calls. No profanity/impersonation control.

**Fix:** DB constraints (`char_length` checks), a validation trigger clamping
score deltas to plausible values, unique-username case handling, and a simple
blocklist filter. Accept that client-reported XP is soft; clamp and monitor.

---

## 🟠 HIGH

- **H1. `profiles.auth_id` is publicly readable** (the `select using (true)` policy
  exposes every column). Leaks auth UUIDs. Fix: public read via a view without
  `auth_id` (like `leaderboard`), tighten the table policy to owner-only.
- **H2. No cloud sync of learning progress.** XP, streaks, SRS state are device-local.
  A paying customer who reinstalls loses everything. Fix: sync progress JSON to a
  `user_state` table (owner-only RLS) — the auth plumbing already exists.
- **H3. Zero observability.** No error tracking, no analytics. You cannot see crashes,
  funnels, or conversion. Fix: Sentry (errors) + PostHog or Plausible (product analytics).
- **H4. Dependency health.** Expo SDK 51 (current is 54); `npm audit`: 39 vulns
  (22 high — mostly dev-server tooling like `ws`/metro, not the shipped static bundle,
  but upgrade before store submission). Anonymous-auth abuse could also inflate
  Supabase usage/cost — set project usage alerts.

## 🟡 MEDIUM

- **M1. Missing brand assets.** `app.json` points at `assets/images/icon.png`,
  `adaptive-icon.png`, `favicon.png` — none exist. No OG/social meta tags either;
  shared links show nothing. Bad for a commercial product.
- **M2. Service worker doesn't actually cache.** It's network-first with a cache
  fallback, but nothing is ever `cache.put()` — offline mode is an illusion, and the
  SW has historically forced hard refreshes. Fix: precache the app shell with a
  versioned cache + `skipWaiting` update flow, or remove the SW until done properly.
- **M3. Content/paywall mismatch.** 35 lessons across 5 worlds teach only a few hundred
  of the 2,013 words; the rest live in the Database/Practice tabs. ฿199/month is steep
  for the current guided-lesson depth (see improvements).
- **M4. No tests or CI.** Nothing runs `tsc`, the vocabulary duplicate checks, or the
  build on push. One bad commit can silently break the deployed site. Fix: GitHub
  Actions running the validation suite + build (and ideally auto-deploying gh-pages).
- **M5. TTS quality is device-dependent.** Web Speech Thai voices vary wildly; on
  devices without a Thai voice, audio silently fails — a core feature for a language app.

## 🟢 LOW

- Hearts refill trusts the device clock (client-side cheat only).
- Manual deploy procedure (documented, but automatable via Actions).
- README/DEVELOPER content counts drift as the database grows.

---

## What's already GOOD ✅

- No secrets leaked (anon key is public by design; no service keys anywhere).
- RLS is enabled with owner-scoped writes — the skeleton is right.
- Clean source tree, documented deploy, reproducible builds, tsc-clean.
- Data quality: 2,013 words, zero duplicate id/th/en, validated every batch.
- Real product differentiators: writing trainer with accuracy scanner, glossed
  reader with word-by-word TTS, Thai-specific content (Muay Thai, ขิม, ผัดซีอิ๊ว…).

## Prioritized improvement backlog

| # | Improvement | Impact | Effort |
|---|---|---|---|
| 1 | Stripe webhook → Supabase entitlements (C1) | Unblocks revenue | 2–4 days |
| 2 | Legal pages + cancel/manage-subscription links (C2) | Unblocks launch | 1 day |
| 3 | DB constraints + score clamping + username filter (C3) | Trust | 1–2 days |
| 4 | Icons, favicon, OG tags, custom domain | Credibility | 1 day |
| 5 | Sentry + PostHog | Visibility | ½ day |
| 6 | CI (tsc + vocab validation + build + deploy) | Safety | ½ day |
| 7 | Cloud progress sync (H2) | Retention/paid UX | 2–3 days |
| 8 | **Auto-generate lessons from the 2,013-word database** (every category → a world/unit; the content is already structured for it) | Turns the DB into 50+ sellable lessons | 2–3 days |
| 9 | Fix or remove service worker; real PWA manifest | UX | 1 day |
| 10 | Bundled audio for top 500 words (or paid TTS for Premium) | Quality | 2–4 days |
| 11 | Expo SDK upgrade → EAS builds → App Store / Play Store | Distribution | 1–2 weeks |
| 12 | Referral rewards (gems) + share cards | Growth | 2 days |
