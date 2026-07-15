import React from 'react';
import LegalPage from '../components/LegalPage';

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="10 July 2026"
      sections={[
        {
          paragraphs: [
            'These terms govern your use of Sanuk Thai, the Thai learning app ("the app"). By using the app you agree to them. If you do not agree, please do not use the app.',
          ],
        },
        {
          heading: '1. The service',
          paragraphs: [
            'The app is a Thai language learning tool: vocabulary, lessons, reading and writing practice, quizzes and a leaderboard. The free tier gives you access to core lessons with a daily hearts limit. Premium (a paid subscription) removes the hearts limit and unlocks all learning worlds.',
          ],
        },
        {
          heading: '2. Accounts',
          paragraphs: [
            'You do not need an account to learn. An optional profile puts you on the global leaderboard. You must be at least 13 years old (or the higher minimum age of digital consent in your country) to create a profile. You are responsible for what you put in your username, display name and bio — no impersonation, offensive content or attempts to game leaderboard scores. We may remove profiles or scores that violate this or that we reasonably believe were obtained by cheating. To report an offensive profile, email us and we will review it promptly.',
          ],
        },
        {
          heading: '3. Premium purchases',
          paragraphs: [
            'Premium is available as an auto-renewing subscription (monthly or annual, at the price shown at purchase) or as a one-time lifetime purchase. Subscriptions renew automatically and payment is charged at confirmation of purchase and at the start of each renewal period, unless you cancel at least 24 hours before the current period ends.',
            'Premium is digital content delivered immediately: by purchasing you expressly request immediate access and acknowledge that this waives any statutory 14-day right of withdrawal once delivery has begun. Where you are billed depends on where you bought it: on the web, billing is processed by Stripe; in the Apple App Store or Google Play, billing is processed by that store. You can cancel at any time and keep Premium until the end of the paid period; there is no lock-in. Prices may change — existing subscribers will be notified before any change affects them.',
          ],
          links: [{ label: 'Refund Policy', href: '/refunds' }],
        },
        {
          heading: '4. Store terms',
          paragraphs: [
            'If you downloaded the app from the Apple App Store or Google Play, your use is additionally subject to that store\'s terms. For App Store copies, Apple\'s Standard End User License Agreement applies where these terms are silent, and Apple is not responsible for the app or its content. Purchases made through a store are subject to the store\'s billing and refund mechanisms.',
          ],
        },
        {
          heading: '5. Fair use',
          paragraphs: [
            'You may not attempt to disrupt the service, scrape or bulk-extract its content database, bypass payment or entitlement checks, or manipulate leaderboard scores. We may suspend access for abuse.',
          ],
        },
        {
          heading: '6. Content and intellectual property',
          paragraphs: [
            'The app, its design, and its curated vocabulary database are protected by copyright. You get a personal, non-transferable licence to use them for learning. Thai words themselves obviously belong to everyone — the protection covers our curation, romanization and presentation.',
          ],
        },
        {
          heading: '7. Disclaimer and liability',
          paragraphs: [
            'The app is provided "as is". We work hard on accuracy, but we do not guarantee that every translation, romanization or tone mark is error-free, and the app is not professional language certification. To the maximum extent permitted by law, our liability is limited to the amount you paid us in the twelve months before the claim. Nothing in these terms limits liability that cannot legally be limited, or your statutory consumer rights.',
          ],
        },
        {
          heading: '8. Termination',
          paragraphs: [
            'You can stop using the app at any time, and permanently delete your account and data from Profile → Delete account (or the /delete-account page). We may discontinue the service or parts of it; if we discontinue Premium features you have paid for, you will be refunded pro rata for the unused period.',
          ],
        },
        {
          heading: '9. Changes to these terms',
          paragraphs: [
            'We may update these terms; the date above reflects the latest version. Continued use after an update means you accept the new terms. Material changes affecting paid features will be announced in the app before they take effect.',
          ],
        },
      ]}
    />
  );
}
