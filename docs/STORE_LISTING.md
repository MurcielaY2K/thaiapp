# Sanuk Thai — App Store / Google Play submission playbook

Everything legal/compliance-related needed to fill in the store consoles.
Legal pages ship inside the app AND are publicly reachable (required):

| Document | Public URL (paste into consoles) |
|---|---|
| Privacy Policy | https://murcielay2k.github.io/sanuk-thai/privacy |
| Terms of Service | https://murcielay2k.github.io/sanuk-thai/terms |
| Refund Policy | https://murcielay2k.github.io/sanuk-thai/refunds |
| **Account deletion** (Play "Data deletion" URL) | https://murcielay2k.github.io/sanuk-thai/delete-account |
| Support contact | coficollective@gmail.com ← confirm this is the address you want on record |

Account deletion is self-serve and immediate: `delete_my_account()` RPC removes
the auth user, which cascades to profile, scores, cloud progress and the
entitlement row. In-app path: **Profile → Delete account**. (Apple guideline
5.1.1(v) and Play's account-deletion policy both require this.)

---

## Google Play — Data safety form answers

**Does your app collect or share any of the required user data types?** Yes.

| Data type | Collected? | Shared? | Optional? | Purpose |
|---|---|---|---|---|
| User IDs (account identifier) | Yes | No | Yes (profile is optional) | Account management |
| Name (username / display name) | Yes | No | Yes | Account management, leaderboard |
| Email address | Yes | No | Yes (only if user links one) | Account management (sign-in/recovery) |
| Other user-generated content (bio) | Yes | No | Yes | App functionality (public profile) |
| App activity (learning progress backup) | Yes | No | Yes (only with cloud backup) | App functionality |
| Purchase history (subscription status) | Yes | No | Yes | App functionality |

Everything else (location, contacts, photos, device IDs for ads, etc.): **Not collected**.

- Is all user data encrypted in transit? **Yes** (HTTPS everywhere).
- Do you provide a way for users to request data deletion? **Yes** — URL above.
- Independent security review: No. Data collected is NOT used for advertising or tracking.

## Apple — App Privacy ("nutrition label") answers

**Data linked to you:**
- Contact Info → Email Address (optional, account recovery) — App Functionality
- Identifiers → User ID — App Functionality
- User Content → Other User Content (username, bio) — App Functionality
- Purchases → Purchase History (subscription status) — App Functionality
- Usage Data → Product Interaction (learning progress backup, optional) — App Functionality

**Data not linked to you:** none beyond the above. **Tracking:** No (no ads, no
cross-app tracking → answer "No" to ATT; no ATT prompt needed).

## Both stores — other required answers

- **Age rating:** no objectionable content, no gambling, no violence.
  Questionnaires should land at Everyone / 4+. The app displays limited UGC
  (usernames/bios on a leaderboard): answer "yes" to UGC questions and point
  moderation/reporting at the support email (Terms §2 covers removal rights).
- **Children:** app is general-audience, not child-directed. Play: do NOT
  enroll in "Designed for Families". Profiles require 13+ (Terms §2).
- **Login requirement:** app is fully usable without an account — no demo
  credentials needed for review.

## Payments: store-compliance (handled in code)

Stripe checkout for Premium is **not allowed inside store builds** (Apple
3.1.1; Play Payments policy). This is now enforced in code:
`constants/stripe.ts → STRIPE_CHECKOUT_ENABLED = Platform.OS === 'web'`. The
Premium modal shows the Stripe button **only on web**; on iOS/Android it shows
"Premium in-app purchase is coming soon" with **no external payment link and no
steering** off-app, so a store build can never violate the billing policy —
even if the paywall is later enabled.

Path to actually sell Premium in the apps: integrate StoreKit / Google Play
Billing (RevenueCat is the low-effort cross-platform option and can feed the
same `entitlements` table via its webhooks), then gate it behind the same
constant. The Stripe Payment Link stays web-only. For the **first** store
release the simplest route is to keep `PREMIUM_ON_HOLD = true` (everyone gets
Premium free, zero purchase UI → zero billing-policy exposure).

Also required for auto-renewing subscriptions on Apple: the App Store listing
must include the subscription name, length, price, and links to the Terms and
Privacy Policy (all of the above), and the purchase screen must link Terms +
Privacy (PremiumModal already does).

## Remaining non-legal build work for stores (tracked, not blocking legal)

- Expo SDK upgrade + EAS build to produce store binaries (current: SDK 51).
- `app.json` iOS `bundleIdentifier` / Android `package` are `com.thaiapp.learn`
  — decide final IDs **before** first upload (they are permanent).
- Supabase dashboard: run **`supabase/setup.sql`** (one paste — includes the
  deletion function and everything else, idempotent), then enable Anonymous +
  Email auth and set the URL config. Steps are in the file's header.
