import React from 'react';
import LegalPage from '../components/LegalPage';

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="10 July 2026"
      sections={[
        {
          paragraphs: [
            'This policy explains what data Sanuk Thai, the Thai learning app ("the app", "we"), collects, why, and what your rights are. The short version: your learning progress lives on your device, an account is optional, and we never sell your data or show ads.',
          ],
        },
        {
          heading: '1. Data stored on your device',
          paragraphs: [
            'Your learning progress — XP, level, streaks, hearts, gems, completed lessons, spaced-repetition history and settings — is stored locally on your device (browser or app storage). It is not sent to us unless you enable cloud backup (section 3). Word pronunciation uses your device\'s built-in text-to-speech; the words you hear are not sent to us.',
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
          heading: '3. Cloud backup and email',
          paragraphs: [
            'If you link an email address, we store it (via Supabase authentication) so you can sign in on a new device, and we back up your learning-progress snapshot to our database so it can be restored. The email is used only for sign-in links and account recovery — no newsletters, no marketing. Progress backups are kept while your account exists and are deleted with it.',
          ],
        },
        {
          heading: '4. Payments',
          paragraphs: [
            'Web subscriptions are processed by Stripe; purchases in the Apple App Store or Google Play are processed by that store. Your card details go directly to the payment processor and never touch our servers — we only receive confirmation that a subscription is active, which we store against your account so the app can unlock Premium features. The processor\'s own privacy policy applies to the payment itself (e.g. stripe.com/privacy).',
          ],
        },
        {
          heading: '5. What we do NOT do',
          paragraphs: [],
          bullets: [
            'No advertising and no ad trackers',
            'No sale or sharing of personal data with third parties for their own purposes',
            'No collection of precise location, contacts, photos or other device data',
          ],
        },
        {
          heading: '6. Service providers',
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
          heading: '7. Your rights (GDPR, PDPA and similar laws)',
          paragraphs: [
            'You can access and correct your profile data in the app at any time. You can permanently delete your account and all associated data yourself from Profile → Delete account (also reachable directly at /delete-account); server-side deletion is immediate. You also have the right to data portability, to object to processing, and to lodge a complaint with your local data-protection authority. To exercise any right, or for any privacy question, email coficollective@gmail.com and we will respond within 30 days.',
          ],
        },
        {
          heading: '8. Children',
          paragraphs: [
            'The app is suitable for general audiences and does not knowingly collect personal data from children under 13. Profiles and payments require whatever age your local law sets for consent; parents who believe a child has created a profile can email us to have it removed.',
          ],
        },
        {
          heading: '9. Changes',
          paragraphs: [
            'If we change this policy we will update this page and the date at the top. Material changes affecting account holders will be flagged in the app.',
          ],
        },
      ]}
    />
  );
}
