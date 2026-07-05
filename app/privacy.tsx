import React from 'react';
import LegalPage from '../components/LegalPage';

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="5 July 2026"
      sections={[
        {
          paragraphs: [
            'This policy explains what data the ภาษาไทย Thai learning app ("the app", "we") collects, why, and what your rights are. The short version: your learning progress lives on your device, an account is optional, and we never sell your data or show ads.',
          ],
        },
        {
          heading: '1. Data stored on your device',
          paragraphs: [
            'Your learning progress — XP, level, streaks, hearts, gems, completed lessons, spaced-repetition history and settings — is stored locally on your device (browser storage). It is not sent to us. Clearing your browser data deletes it.',
          ],
        },
        {
          heading: '2. Data you give us when you create a profile',
          paragraphs: [
            'Creating a profile is optional and is only needed for the global leaderboard. If you create one, we store the following in our database (hosted by Supabase):',
          ],
          bullets: [
            'Your chosen username, optional display name, bio, avatar emoji and country flag',
            'Your leaderboard score (XP)',
            'An internal account identifier',
          ],
        },
        {
          heading: '3. Payments',
          paragraphs: [
            'Premium subscriptions are processed by Stripe. Your card details go directly to Stripe and never touch our servers — we only receive confirmation that a subscription is active, which we store against your account so the app can unlock Premium features. Stripe\'s own privacy policy applies to the payment itself (stripe.com/privacy).',
          ],
        },
        {
          heading: '4. What we do NOT do',
          paragraphs: [],
          bullets: [
            'No advertising and no ad trackers',
            'No sale or sharing of personal data with third parties for their own purposes',
            'No collection of precise location, contacts, photos or other device data',
          ],
        },
        {
          heading: '5. Service providers',
          paragraphs: [
            'We rely on a small number of processors to run the app:',
          ],
          bullets: [
            'GitHub Pages — hosts the app itself; GitHub may log standard technical request data (IP address, user agent)',
            'Supabase — database for profiles, leaderboard and subscription status',
            'Stripe — payment processing',
            'Google Fonts — the app loads its fonts from Google\'s servers, which involves your IP address being sent to Google',
          ],
        },
        {
          heading: '6. Your rights (GDPR and similar laws)',
          paragraphs: [
            'You can access, correct or delete your profile data at any time. Profile deletion is available in the app and removes your data from our database. You also have the right to data portability, to object to processing, and to lodge a complaint with your local data-protection authority. To exercise any right, or for any privacy question, email coficollective@gmail.com.',
          ],
        },
        {
          heading: '7. Children',
          paragraphs: [
            'The app is suitable for general audiences and does not knowingly collect personal data from children under 13. Profiles and payments require whatever age your local law sets for consent; parents who believe a child has created a profile can email us to have it removed.',
          ],
        },
        {
          heading: '8. Changes',
          paragraphs: [
            'If we change this policy we will update this page and the date at the top. Material changes affecting account holders will be flagged in the app.',
          ],
        },
      ]}
    />
  );
}
