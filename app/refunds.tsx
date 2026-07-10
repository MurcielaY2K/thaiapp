import React from 'react';
import LegalPage from '../components/LegalPage';

export default function Refunds() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="10 July 2026"
      sections={[
        {
          paragraphs: [
            'Sanuk Thai Premium is a monthly subscription (฿199/month). How cancellation and refunds work depends on where you purchased: on the web (processed by Stripe), or through the Apple App Store or Google Play.',
          ],
        },
        {
          heading: 'Cancelling',
          paragraphs: [
            'You can cancel at any time. Cancellation stops future charges; you keep Premium until the end of the period you already paid for. No partial-month charges apply after cancellation.',
            'Web (Stripe): use the manage-subscription link in your Stripe receipt email, or email us and we will cancel it for you. App Store: Settings → your name → Subscriptions. Google Play: Play Store → Payments & subscriptions.',
          ],
        },
        {
          heading: 'Purchases made through the App Store or Google Play',
          paragraphs: [
            'Refunds for store purchases are handled by the store, under its own policy: for Apple, request at reportaproblem.apple.com; for Google Play, use your order history or the Play refund flow. We cannot issue refunds for charges we did not process, but email us and we will help you with the request.',
          ],
        },
        {
          heading: 'Refunds (web purchases)',
          paragraphs: [
            'If something went wrong — you were charged after cancelling, charged twice, or Premium features did not work — email us within 30 days of the charge and we will refund it.',
            'If you simply changed your mind, email us within 14 days of a charge and we will refund that charge, provided the request is made in good faith (not a pattern of subscribing, using heavily and refunding every month).',
          ],
        },
        {
          heading: 'EU / UK consumers',
          paragraphs: [
            'If you are a consumer in the EU or UK, you have a statutory 14-day right of withdrawal from the date of purchase. By starting your subscription immediately, you consent to the service beginning within the withdrawal period; if you withdraw within 14 days, we will refund the charge in full. Nothing in this policy limits your statutory rights.',
          ],
        },
        {
          heading: 'How to request a refund',
          paragraphs: [
            'Email coficollective@gmail.com from the address associated with your payment, including the approximate charge date. Refunds are issued to the original payment method via Stripe, normally within 5–10 business days.',
          ],
        },
      ]}
    />
  );
}
