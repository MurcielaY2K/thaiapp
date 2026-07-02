# Payments: server-verified Premium — deployment guide

The code for secure entitlements is in the repo (client wiring, SQL, webhook
function). Premium is granted **only** by Stripe webhooks writing to the
`entitlements` table — never by the client. Three one-time deployment steps
connect it all; until then the app keeps working (everyone is Premium anyway
while `PREMIUM_ON_HOLD = true`).

## How it works

```
PremiumModal → Stripe Payment Link ?client_reference_id=<supabase auth uuid>
        Stripe → webhook → Edge Function `stripe-webhook`
                → verifies signature → upserts public.entitlements (service role)
App start / return from checkout → refreshEntitlement()
                → reads own entitlements row (RLS: owner-only)
                → isPremium = active/past_due within period (+1 day grace)
```

Clients have **no write access** to `entitlements` (no RLS insert/update
policies); the old `?payment_success=1` self-unlock and the
`@thaiapp_premium` localStorage flag are no longer honored.

## Step 1 — Create the table

Supabase Dashboard → SQL Editor → run `supabase/entitlements.sql`.

## Step 2 — Deploy the webhook function

```bash
supabase link --project-ref utshlbvqwlojovnlnhxd   # once
supabase secrets set STRIPE_SECRET_KEY=sk_live_...        # dashboard → Developers → API keys
supabase functions deploy stripe-webhook --no-verify-jwt  # Stripe calls it unauthenticated
```

## Step 3 — Point Stripe at it

Stripe Dashboard → Developers → Webhooks → **Add endpoint**
- URL: `https://utshlbvqwlojovnlnhxd.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`,
  `customer.subscription.deleted`, `invoice.payment_failed`
- Copy the signing secret, then:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

Also confirm the Payment Link's after-payment redirect is still
`https://murcielay2k.github.io/thaiapp/?payment_success=1` (the param now only
triggers a server re-check, it grants nothing).

## Test matrix (run in Stripe test mode first)

| Case | Expected |
|---|---|
| Buy with card `4242…` | entitlements row `active`; app shows Premium within ~30 s of redirect |
| Fake it: visit `?payment_success=1` without paying | nothing unlocks |
| Set `@thaiapp_premium` in DevTools | nothing unlocks (key ignored) |
| Cancel the subscription in Stripe | row → `canceled`; app re-locks on next load after period end |
| Failing renewal (test clock / `4000 0000 0000 0341`) | row → `past_due`; access holds ≤ period end + 1 day, then locks |
| Clear browser data, sign back in with same account | Premium restored from server |

## Notes

- **Restore on a new device** requires the user to be signed in as the same
  auth user. Anonymous auth survives in local storage only — the email
  sign-in upgrade (launch plan Phase 1) is what makes restores reliable.
- **Pre-launch payers** (anyone who paid via the old link): grant manually —
  insert a row in `entitlements` with their auth uuid, or refund.
- A payment made with no `client_reference_id` (shouldn't happen from the
  app) is logged by the function and needs manual linking.
