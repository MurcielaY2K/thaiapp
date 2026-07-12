import { Platform } from 'react-native';

// Apple App Store Review 3.1.1 and Google Play's Payments policy forbid using
// a third-party processor (Stripe) for in-app digital subscriptions — and
// forbid even linking out to one from inside the app. Until native in-app
// purchase (StoreKit / Google Play Billing) is wired up, the Stripe checkout
// is WEB-ONLY. Store (iOS/Android) builds must never open or link to it.
export const STRIPE_CHECKOUT_ENABLED = Platform.OS === 'web';

// ── Premium tiers ────────────────────────────────────────────────────────────
// Each tier is a Stripe Payment Link (dashboard.stripe.com → Payment Links).
// A tier with an empty link is HIDDEN in the app, so tiers can be created in
// Stripe one at a time and go live by pasting the URL here.
//
// Creating the missing links:
//   Annual   — product "Sanuk Thai Premium (Annual)",  ฿1,190 THB, recurring yearly
//   Lifetime — product "Sanuk Thai Premium (Lifetime)", ฿1,990 THB, ONE-TIME payment
//   Both: After payment → redirect to
//     https://murcielay2k.github.io/sanuk-thai/?payment_success=1
// The existing webhook + entitlements table already handle all three: a
// one-time checkout.session.completed (no subscription) grants an
// entitlement with no period end = never expires. No backend changes needed.

export interface PremiumTier {
  id: 'monthly' | 'annual' | 'lifetime';
  label: string;
  price: string;
  per: string;
  note?: string;       // small selling line under the price
  link: string;        // Stripe Payment Link ('' hides the tier)
  highlight?: boolean; // visually emphasized (the tier we want people to pick)
}

export const PREMIUM_TIERS: PremiumTier[] = [
  {
    id: 'monthly', label: 'MONTHLY', price: '฿199', per: '/ month',
    note: 'Cancel anytime',
    link: 'https://buy.stripe.com/fZuaEPai75mJ5d6asJ77O03',
  },
  {
    id: 'annual', label: 'ANNUAL', price: '฿1,190', per: '/ year',
    note: 'Save 50%', highlight: true,
    link: '', // paste the Annual Payment Link here to go live
  },
  {
    id: 'lifetime', label: 'LIFETIME', price: '฿1,990', per: 'one-time',
    note: 'Pay once, keep forever',
    link: '', // paste the Lifetime Payment Link here to go live
  },
];

export function availableTiers(): PremiumTier[] {
  return PREMIUM_TIERS.filter(t => t.link.length > 0);
}

// The URL param Stripe appends on redirect-back success
export const STRIPE_SUCCESS_PARAM = 'payment_success';

// Payment link with the buyer's Supabase auth uuid attached. The Stripe
// webhook receives it as checkout.session.client_reference_id and grants
// the entitlement to that user — the app never self-grants Premium.
export function paymentLinkFor(tier: PremiumTier, authId: string | null): string {
  return authId
    ? `${tier.link}?client_reference_id=${encodeURIComponent(authId)}`
    : tier.link;
}
