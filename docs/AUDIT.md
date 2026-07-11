# Sanuk Thai — Security & Quality Audit

*Re-audited: 2026-07-10 · Scope: full codebase, Supabase backend (SQL + Edge Function), payments, web deploy.*
*Previous audit (launch readiness) is superseded; its critical items C1–C3, H1–H4 and M1/M2/M4 have all been implemented since.*

**Verdict:** codebase is in good shape. No secrets leaked, RLS is owner-scoped with
server-side clamps, Premium is server-verified via Stripe webhook, and the client
renders all user content through React Native `Text` (no HTML injection surface).
The re-audit found **one high-severity client-side hole and a set of medium/low
hardening gaps — all fixed in this pass** (see "Fixed in this audit").

Current commercial status: `PREMIUM_ON_HOLD = true` (everyone gets Premium free
while testing). Flip `constants/features.ts` to launch the paywall.

---

## Fixed in this audit (2026-07-10)

### 🔴 A1. Deep-linked routes bypassed progression/paywall and could wipe saved progress — FIXED
Routed screens (`/lesson`, `/session`, `/write`, `/read`) never hydrated the
zustand stores. Opening a crafted URL like `…/sanuk-thai/lesson?lessonId=w12f-cp`:
1. played **any** lesson directly — skipping progression locks and (when the
   paywall is live) `premium-locked` gating, and
2. worse, rendered against **empty** stores, so the first write
   (`completeLesson`, `recordAnswer`, `markWritten`) persisted the default
   state map and **wiped the user's saved progress**.

Fix: `app/_layout.tsx` now hydrates all stores before any route renders, and
`app/lesson.tsx` refuses to start a lesson whose stored state isn't
`available`/`complete` (shows a 🔒 screen instead). Verified by browser test:
locked deep link blocks + progress intact; available deep link still plays.

### 🟠 A2. Cloud snapshot applied without validation — FIXED
`pullAndMerge()` wrote the remote `progress_sync` JSON straight into
AsyncStorage. A stale/truncated/hand-edited snapshot could poison local state
(NaN XP, bogus lesson states, corrupt SRS scheduler dates). Fix:
`sanitizeSnapshot()` in `lib/progressSync.ts` — type/range-coerces every field
(XP/gems/streak clamped, lesson states whitelisted, SRS entries numerically
validated, rewards list capped) before anything is persisted.

### 🟠 A3. Magic-link restore created accounts for any typed email — FIXED
`signInWithOtp` defaulted to `shouldCreateUser: true`: a typo'd email silently
created a fresh empty account (confusing "lost my progress" support cases, and
an account-spam vector). Fix: `shouldCreateUser: false` in the restore flow +
a friendly "No account found" message.

### 🟡 A4. Local storage parsed without guards — FIXED
`progressStore.load()` trusted stored values (`Number(xpJ)` NaN, unvalidated
`skillLevel`, unchecked hearts object shape). All coerced/whitelisted now.

### 🟡 A5. Username-taken race silently masked — FIXED
If two users raced for the same username, the unique-constraint violation was
swallowed by the offline fallback: the loser got a *local* profile whose
cloud name belongs to someone else. Postgres error `23505` now surfaces as
"Username already taken".

### 🟡 A6. SECURITY DEFINER function without pinned search_path — FIXED
`public.clamp_score()` (and the size-guard trigger) now `set search_path =
public`, per Supabase linter guidance. **Action required: re-run
`supabase/hardening.sql` and `supabase/progress_sync.sql` in the SQL editor.**

### 🟡 A7. No CSP / referrer policy — FIXED (partial by platform)
GitHub Pages can't send security headers. Added what meta-CSP supports:
`object-src 'none'; base-uri 'none'` (blocks plugin/`<base>` injection) and
`referrer: no-referrer`. A full `script-src` CSP isn't feasible: Expo's static
export emits inline scripts. Revisit if the app moves to a host with headers.

---

## Verified clean (no action)

- **Secrets** — tree + git history scanned: no service-role keys, Stripe
  secrets, or private keys. The committed Supabase anon key is public by design
  (RLS is the security boundary).
- **RLS** — profiles/scores/progress_sync/entitlements all owner-scoped writes;
  `auth_id` column revoked from client SELECT; entitlements have **no** client
  write policy (webhook/service-role only). Score clamps kill the
  console-command leaderboard attack.
- **Stripe webhook** — signature-verified (`constructEventAsync`), pinned API
  version, entitlement keyed to `client_reference_id` (auth uuid), handles
  update/delete/payment-failure. Client never self-grants: `refreshEntitlement`
  reads the entitlements row and ignores the legacy localStorage flag.
- **XSS** — no `dangerouslySetInnerHTML`/`eval`/`innerHTML` outside the static
  HTML shell; all user-generated content (usernames, bios, leaderboard,
  avatars, flags) renders through RN `Text`, which escapes. Payment link opened
  with `noopener,noreferrer`.
- **Service worker** — scoped to `/sanuk-thai/`, network-first with same-origin
  `res.ok` cache fallback, self-heals foreign workers without forced reloads.
- **Dependencies** — `npm audit`: 39 findings, **all in the dev/build
  toolchain** (metro/`ws` etc.), none shipped in the static bundle. Runtime
  deps (react 18.2, supabase-js 2.108, zustand 4.5, sentry 10) are current.

## Remaining (accepted risks / backlog)

| # | Item | Risk | Note |
|---|------|------|------|
| R1 | Client-reported XP is soft-trust | Low | Server clamps (≤2000/sync); acceptable for a casual leaderboard. |
| R2 | Hearts refill trusts device clock | Cosmetic | Self-cheat only. |
| R3 | Expo SDK 51 (current 54) | Low now | Upgrade before app-store submission; clears dev-chain `npm audit` noise too. |
| R4 | No profanity filter on usernames/bios | Low | Add a blocklist before scale; content length is already DB-constrained. |
| R5 | SW cache never evicts old hashed bundles | Cosmetic | Bounded by browser storage eviction. |
| R6 | Anonymous sign-in abuse could inflate Supabase usage | Low | Set project usage alerts in dashboard. |

## Operator checklist (dashboard actions, not code)

1. Run in Supabase SQL editor (idempotent): `schema.sql`, `hardening.sql`
   *(updated in this audit)*, `progress_sync.sql` *(updated)*, `entitlements.sql`.
2. Enable **Authentication → Providers → Anonymous** and **Email** (magic link).
3. Set Site URL / Redirect URL to `https://murcielay2k.github.io/sanuk-thai/`.
4. Deploy the Stripe webhook per `docs/PAYMENTS_SETUP.md`.
5. Before charging money: set `PREMIUM_ON_HOLD = false`.
