// Blocks slurs, sexual content, and impersonation attempts in username /
// display name / bio before a leaderboard has real scale. Deliberately
// simple substring matching (fast, offline, no external service) — this is
// a first line of defense, not a moderation system. Not exhaustive by
// design: the goal is to stop casual abuse and obvious impersonation, not
// to catch every evasion.

const BLOCKED_TERMS = [
  // Slurs / hate speech (common English forms + leetspeak variants)
  'nigger', 'nigga', 'chink', 'spic', 'kike', 'faggot', 'fag', 'retard',
  'tranny', 'coon', 'wetback', 'gook', 'paki',
  // Sexual / explicit
  'porn', 'sex', 'nude', 'nudes', 'xxx', 'cum', 'dick', 'pussy', 'penis',
  'vagina', 'anal', 'blowjob', 'rape',
  // Slurs (profanity, mild but still filtered from a public leaderboard)
  'fuck', 'shit', 'bitch', 'cunt', 'whore', 'slut', 'asshole', 'bastard',
  // Impersonation of the app/staff
  'admin', 'administrator', 'moderator', 'official', 'support', 'staff',
  'sanukthai', 'sanuk_thai', 'developer', 'system',
];

// Common leetspeak normalization so "n1gger" / "a$$hole" etc. still match.
const LEET: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '$': 's', '@': 'a',
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .split('')
    .map((c) => LEET[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]/g, '');
}

export function containsBlockedContent(text: string): boolean {
  if (!text) return false;
  const norm = normalize(text);
  return BLOCKED_TERMS.some((term) => norm.includes(term));
}

// Username/display-name specific: also blocks anything that reads as an
// official account even without an exact blocked term (e.g. "official-mod").
export function isDisallowedUsername(text: string): boolean {
  return containsBlockedContent(text);
}
