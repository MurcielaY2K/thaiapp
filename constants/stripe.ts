import { Platform } from 'react-native';

// Apple App Store Review 3.1.1 and Google Play's Payments policy forbid using
// a third-party processor (Stripe) for in-app digital subscriptions — and
// forbid even linking out to one from inside the app. Until native in-app
// purchase (StoreKit / Google Play Billing) is wired up, the Stripe checkout
// is WEB-ONLY. Store (iOS/Android) builds must never open or link to it.
export const STRIPE_CHECKOUT_ENABLED = Platform.OS === 'web';

// Configure your Stripe Payment Link here.
// Steps:
//   1. Go to dashboard.stripe.com → Payment Links → Create link
//   2. Product: "Thai App Premium", 199 THB, recurring monthly
//   3. After-payment: set "Don't show confirmation page" →
//      Redirect to: https://murcielay2k.github.io/thaiapp/?payment_success=1
//   4. Replace the URL below with your generated link.
export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/fZuaEPai75mJ5d6asJ77O03';

// The URL param Stripe appends on redirect-back success
export const STRIPE_SUCCESS_PARAM = 'payment_success';

// Payment link with the buyer's Supabase auth uuid attached. The Stripe
// webhook receives it as checkout.session.client_reference_id and grants
// the entitlement to that user — the app never self-grants Premium.
export function paymentLinkFor(authId: string): string {
  return `${STRIPE_PAYMENT_LINK}?client_reference_id=${encodeURIComponent(authId)}`;
}
