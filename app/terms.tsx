import React from 'react';
import LegalPage from '../components/LegalPage';

export default function Terms() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="5 July 2026"
      sections={[
        {
          paragraphs: [
            'These terms govern your use of the ภาษาไทย Thai learning app ("the app"). By using the app you agree to them. If you do not agree, please do not use the app.',
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
            'You do not need an account to learn. An optional profile puts you on the global leaderboard. You are responsible for what you put in your username, display name and bio — no impersonation, offensive content or attempts to game leaderboard scores. We may remove profiles or scores that violate this or that we reasonably believe were obtained by cheating.',
          ],
        },
        {
          heading: '3. Premium subscription',
          paragraphs: [
            'Premium costs ฿199 per month, billed through Stripe until you cancel. You can cancel at any time and keep Premium until the end of the paid period; there is no lock-in. Prices may change — existing subscribers will be notified before any change affects them. See our Refund Policy for refunds.',
          ],
        },
        {
          heading: '4. Fair use',
          paragraphs: [
            'You may not attempt to disrupt the service, scrape or bulk-extract its content database, bypass payment or entitlement checks, or manipulate leaderboard scores. We may suspend access for abuse.',
          ],
        },
        {
          heading: '5. Content and intellectual property',
          paragraphs: [
            'The app, its design, and its curated vocabulary database are protected by copyright. You get a personal, non-transferable licence to use them for learning. Thai words themselves obviously belong to everyone — the protection covers our curation, romanization and presentation.',
          ],
        },
        {
          heading: '6. Disclaimer and liability',
          paragraphs: [
            'The app is provided "as is". We work hard on accuracy, but we do not guarantee that every translation, romanization or tone mark is error-free, and the app is not professional language certification. To the maximum extent permitted by law, our liability is limited to the amount you paid us in the twelve months before the claim. Nothing in these terms limits liability that cannot legally be limited, or your statutory consumer rights.',
          ],
        },
        {
          heading: '7. Termination',
          paragraphs: [
            'You can stop using the app or delete your profile at any time. We may discontinue the service or parts of it; if we discontinue Premium features you have paid for, you will be refunded pro rata for the unused period.',
          ],
        },
        {
          heading: '8. Changes to these terms',
          paragraphs: [
            'We may update these terms; the date above reflects the latest version. Continued use after an update means you accept the new terms. Material changes affecting paid features will be announced in the app before they take effect.',
          ],
        },
      ]}
    />
  );
}
