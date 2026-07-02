# ภาษาไทย Thai App — Commercial Launch Plan

Goal: paying customers fast, without launching broken. Four phases, ~4–6 weeks.
Pre-reqs come from `AUDIT.md` — the plan sequences them so marketing never waits on code.

---

## Phase 0 — Test & Harden (now → ~1 week)  *Premium is ON HOLD*

Everything is free right now (`PREMIUM_ON_HOLD = true`) — use it.

**Testing checklist (all layers):**
- [ ] Learn path: every lesson in all 5 worlds start-to-finish (hearts off, so no friction)
- [ ] Practice/SRS: session flow, streak bump, star scoring, TTS on iPhone/Android/desktop
- [ ] Write: watch + trace + accuracy scanner on a real phone (pointer capture!)
- [ ] Read: all stories & 16 phrase categories, read-all highlight, speed control
- [ ] Database: all 55 categories render, search, and speak
- [ ] Profile/leaderboard: signup, username collision, score sync, rank display
- [ ] Rewards/gems/badges: unlock toasts, frames, avatar packs
- [ ] Fresh-device onboarding + a second device for the same profile
- [ ] Offline / flaky network behaviour, and a service-worker update (no stale app)

**Parallel build work:** icons/favicon/OG tags, legal pages, Sentry + analytics, CI.
**Exit criteria:** zero blocking bugs; analytics events flowing.

## Phase 1 — Monetization done right (week 2)

1. Supabase `entitlements` table + Stripe webhook Edge Function (AUDIT C1).
2. Email sign-in (magic link) as an upgrade from anonymous — required to buy.
3. Backend hardening: DB constraints, score clamping, `auth_id` hidden (C3/H1).
4. Cloud progress sync (H2) — the paid promise: "your Thai, on every device".
5. Re-price before flipping the flag:
   - **Free tier:** first world + database browsing + 1 SRS session/day (hearts).
   - **Premium ฿99–149/mo or ฿990/yr** (undercut tutoring, not Duolingo's free tier).
   - **Founder lifetime ฿1,490, first 100 customers** — creates urgency, funds Phase 3.
   - 7-day free trial via Stripe.
6. Flip `PREMIUM_ON_HOLD = false`. Verify: buy → unlock, cancel → re-lock, refund → re-lock, new device → restore.

## Phase 2 — Soft launch / beta (weeks 2–4, overlaps Phase 1)

Target: **100 real learners, 10 paying, testimonials in hand.**

- Custom domain (e.g. `learnthai.app` style) on GitHub Pages — a `github.io` URL
  doesn't sell subscriptions.
- Recruit where Thai learners already are:
  - Reddit r/LearnThai (~60k), r/Thailand
  - Facebook: "Thai Language Learners", Bangkok/Chiang Mai/Phuket expat groups
  - Discord Thai-learning servers; ThaiVisa/ASEAN NOW forums
  - Offer beta users the founder-lifetime price for feedback + a testimonial
- Instrument the funnel: visit → first lesson complete (activation) → D1/D7 return →
  trial start → paid. Fix the biggest drop-off each week.
- Collect 5–10 quotable testimonials and screen recordings.

## Phase 3 — Public launch (weeks 4–6)

**The demo IS the marketing.** The trace-the-letter scanner and word-by-word reader
are unusually visual — lead every asset with a 15–30s screen capture.

- **Landing page** on the custom domain: hero video, testimonials, pricing, FAQ, legal.
- **Short-form video** (TikTok/IG Reels/YT Shorts): "Can you write ก?" trace-scan
  clips, "How to order noodles in Thai" phrasebook clips — 3–5/week. This audience
  (expats/travellers in Thailand) is heavily on TikTok.
- **Product Hunt** launch (Tuesday–Thursday) with the beta cohort primed to comment.
- **YouTube Thai-learning channels**: offer creators 30–50% affiliate codes rather
  than paying upfront.
- **SEO seeds:** the phrasebook categories are ready-made articles ("50 Thai words
  for the market", "Thai for the gym") linking into the app.
- **Communities:** honest "I built this" posts in the Phase-2 channels with the
  founder deal — these convert best when you're already a known contributor.

## Phase 4 — Post-launch growth (ongoing)

- **App stores** via Expo EAS (the codebase is already Expo) — App Store/Play unlock
  the biggest channel + native IAP; requires the SDK upgrade (AUDIT H4).
- **Growth loops already built, just amplify:** streaks (add push/email streak
  reminders), leaderboard (weekly league resets), gems (referral: give 50/get 50).
- **Share cards:** "🔥 30-day streak / 500 words mastered" image share button.
- **Content cadence:** one new world/unit per month from the 2,013-word database
  (auto-generated lessons, AUDIT improvement #8) — announce each to the email list.
- **B2B angle later:** Thai schools for expats, corporate relocation packages.

---

## KPIs

| Metric | Beta target | Launch target |
|---|---|---|
| Activation (first lesson complete) | 60% | 70% |
| D7 retention | 20% | 30% |
| Trial → paid | 25% | 35% |
| Paying customers | 10 | 100 in first 60 days |
| MRR | ฿1.5k | ฿10–15k |

## Launch-week gate (all must be true)
- [ ] Entitlements verified server-side (buy/cancel/refund/restore all tested)
- [ ] Legal pages live + cancel path in-app
- [ ] Leaderboard clamped; auth_id hidden
- [ ] Icons/OG/custom domain live
- [ ] Sentry quiet for 7 days; analytics funnel visible
- [ ] CI green on main; deploy automated
