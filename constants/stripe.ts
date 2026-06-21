// Configure your Stripe Payment Link here.
// Steps:
//   1. Go to dashboard.stripe.com → Payment Links → Create link
//   2. Product: "Thai App Premium", 199 THB, recurring monthly
//   3. After-payment: set "Don't show confirmation page" →
//      Redirect to: https://murcielay2k.github.io/thaiapp/?payment_success=1
//   4. Replace the URL below with your generated link.
export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/REPLACE_WITH_YOUR_LINK';

// The URL param Stripe appends on redirect-back success
export const STRIPE_SUCCESS_PARAM = 'payment_success';
