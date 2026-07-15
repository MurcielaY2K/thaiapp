import React from 'react';
import LegalPage from '../components/LegalPage';

export default function Refunds() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="15 July 2026"
      sections={[
        {
          paragraphs: [
            'Sanuk Thai Premium is digital content delivered immediately on purchase. Because access begins the moment payment completes, all sales are final except as set out below or where a refund is required by law.',
          ],
        },
        {
          heading: 'Cancelling a subscription',
          paragraphs: [
            'You can cancel at any time and keep Premium until the end of the period you already paid for. Cancellation stops all future charges; no further action is needed. Partial periods are not refunded pro rata.',
            'Web (Stripe): use the manage-subscription link in your Stripe receipt email, or email us and we will cancel it for you. App Store: Settings → your name → Subscriptions. Google Play: Play Store → Payments & subscriptions.',
          ],
        },
        {
          heading: 'Billing errors',
          paragraphs: [
            'If you were charged after cancelling, charged twice for the same period, or paid and did not receive Premium, email us within 30 days of the charge and we will correct it and refund the erroneous amount.',
          ],
        },
        {
          heading: 'Immediate delivery and the right of withdrawal (EU/UK)',
          paragraphs: [
            'By completing a purchase you expressly request immediate access to Premium and acknowledge that, once delivery of the digital content has begun, you lose the statutory 14-day right of withdrawal (Art. 16(m), Directive 2011/83/EU and the equivalent UK provision). This does not affect your statutory rights in respect of content that is faulty or not as described.',
          ],
        },
        {
          heading: 'Lifetime purchases',
          paragraphs: [
            'Lifetime Premium is a one-time purchase of digital content delivered immediately, and is non-refundable except in the case of a billing error or where a refund is required by law.',
          ],
        },
        {
          heading: 'Purchases made through the App Store or Google Play',
          paragraphs: [
            'Refunds for store purchases are handled exclusively by the store under its own policy: for Apple, request at reportaproblem.apple.com; for Google Play, use your order history. We cannot issue refunds for charges we did not process.',
          ],
        },
        {
          heading: 'Contact',
          paragraphs: [
            'Email coficollective@gmail.com from the address associated with your payment, including the approximate charge date. Approved refunds are issued to the original payment method via Stripe, normally within 5–10 business days.',
          ],
        },
      ]}
    />
  );
}
