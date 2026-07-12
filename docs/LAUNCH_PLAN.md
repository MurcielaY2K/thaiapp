# Sanuk Thai — path to a paid launch

State of play (July 2026): infrastructure is done (sync, entitlements, legal,
updates, security, dual-host builds). What stands between here and charging
money is **content quality + distribution**, in this order.

## ✅ Just shipped (this session)

- **New elephant mascot** — redrawn side-view pixel elephant (icon, favicon,
  apple-touch, adaptive icon, OG card, in-app avatar sprite).
- **Audio system** — `lib/audio.ts` plays pre-recorded MP3s when they exist
  and falls back to the *best available* Thai system voice (ranked, cached)
  instead of the first one. All speech call sites now route through it.
- **Audio pipeline** — `scripts/gen-audio.mjs` batch-generates near-native
  neural TTS clips for lesson words + alphabet names (needs a key, see below).
- **Self-hosted analytics** — `supabase/analytics.sql` + `lib/analytics.ts`;
  9 funnel events (app_open, level_picked, lesson_start/complete/fail,
  profile_created, email_linked, paywall_view, checkout_click). No PII, no
  third-party trackers. Retention/funnel queries included in the SQL file.
- **Native-review package** — `docs/audit/vocab-audit.csv` (3,062 words,
  lesson words first, reviewer columns ready).

## 🔑 Step 1 — Native-quality audio (highest leverage, ~1 hour of your time)

1. Create a Google Cloud account → enable **Cloud Text-to-Speech API** →
   create an API key. (Or Azure Speech: key + region.) Free tier covers this
   entire batch with huge margin.
2. Run: `GOOGLE_TTS_KEY=your-key node scripts/gen-audio.mjs`
3. `npm run deploy:web`
Every lesson word now sounds near-native on every device. Re-run any time —
it's incremental.

## 🔑 Step 2 — Native speaker review (~$100–200, one week)

1. Post on Upwork/Fastwork: "Review Thai vocabulary entries for a
   language-learning app: check romanization + translation. CSV provided."
   (Fastwork.co is the Thai freelance platform — cheaper, native reviewers.)
2. Send `docs/audit/vocab-audit.csv` — reviewer fills `reviewer_ok` /
   `reviewer_correction` columns. Lesson words (top of the file) first.
3. Return the CSV to Claude → corrections applied in one pass.

## 🔑 Step 3 — Run the analytics SQL, watch for 2 weeks

Paste `supabase/analytics.sql` in the Supabase SQL editor (one Run). The app
is already instrumented. Before making any pricing/paywall decision, look at:
day-7 retention, lesson_complete per device, and where the funnel leaks.
Queries are at the bottom of the SQL file.

## 💰 Step 4 — Pricing & paywall flip (only after 1–3)

Recommended tiers:
| Tier | Price |
|---|---|
| Monthly | ฿199 / $5.99 |
| **Annual (push this)** | ฿1,190 / $34.99 ("save 50%") |
| Lifetime (launch offer) | ฿1,990 / $59.99 |

**The 3-tier picker UI is already built** (PremiumModal + constants/stripe.ts).
To go live: create the Annual + Lifetime Payment Links in Stripe (details in
the comments in `constants/stripe.ts`; lifetime = one-time payment — the
webhook + entitlements already handle it), paste the two URLs into
`PREMIUM_TIERS`, deploy, and flip `PREMIUM_ON_HOLD = false`. Tiers without a
link stay hidden, so this can go live one tier at a time.
**Grandfather early testers**: announce the flip in-app a week ahead.

## 📱 Step 5 — App stores (2–3 weeks, mostly waiting)

1. Apple Developer ($99/yr) + Google Play ($25 one-time) accounts.
2. Expo SDK upgrade 51 → latest, then `eas build` (identifiers/copy/compliance
   already prepared: `docs/STORE_LISTING.md`, `docs/STORE_COPY.md`).
3. `eas update` gives store apps the same instant-update flow the web has.
4. In-app purchases: RevenueCat (free tier) feeding the same entitlements
   table — required before charging inside store apps (web Stripe stays).

## 📣 Step 6 — Distribution (ongoing, the actual hard part)

- Wedge: **Duolingo has no Thai course.** Target searches/communities asking
  "Duolingo for Thai": r/learnthai, Facebook expat groups (Chiang Mai/BKK),
  TikTok/IG short-form ("3 Thai words tourists always get wrong" style).
- Post the web app to Product Hunt / Hacker News once audio (Step 1) ships.
- Custom domain (`sanukthai.com` + Cloudflare Pages, playbook in
  docs/REBRAND.md) before any promotion push — links people share should be
  the brand, not github.io.

## Later / nice-to-have

- Push-notification streak reminders (web push works on iOS home-screen apps
  now; needs a small Supabase edge function + VAPID keys — ask Claude).
- Sentence/phrase questions woven into checkpoint lessons (phrasebook data
  already exists in `data/phrases.ts` — content-design pass with Claude).
- Word-by-word read-along using recorded audio (currently Web Speech only).
- Leaderboard cold-start: seed with your own few profiles; add a friendly
  "be the first from your country" empty state.
