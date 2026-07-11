# Sanuk Thai — store listing copy & branding kit

Paste-ready marketing copy for App Store Connect and Google Play Console.
Compliance answers (data safety, privacy labels, URLs) live in
[STORE_LISTING.md](./STORE_LISTING.md); this file is the *selling* side.

## Identity

| Field | Value |
|---|---|
| App name (both stores) | **Sanuk Thai: Learn Thai** |
| iOS subtitle (30 chars max) | `Fun Thai words, reading, writing` → use: **`Words, reading & writing`** |
| Play short description (80 chars) | **Learn Thai the fun way — 3,100+ words, writing practice, and daily streaks.** |
| Bundle ID / package | `com.sanukthai.app` (already set in app.json — permanent after first upload) |
| Category | Education (secondary: none) |
| Age rating | Everyone / 4+ |
| Brand color | `#ff5c1e` (ember orange) on `#f0eee7` (paper) |
| Mascot | The pixel elephant (app icon) + naga mascot in-app |
| Tagline | **Learn Thai the fun way.** |

*Sanuk* (สนุก) = "fun" in Thai — mention it in the first line of the
description; it's the brand story in one word.

## Long description (both stores)

> **Sanuk (สนุก) means fun — and it's the whole point.**
>
> Sanuk Thai turns learning Thai into a pixel-art adventure. Climb a path of
> bite-sized lessons, keep your streak alive, and compete on a global
> leaderboard while building real skills: speaking, listening, reading, and
> even writing the Thai alphabet.
>
> **WHY LEARNERS LOVE IT**
> • 3,100+ curated words across 45 themed worlds — food, travel, family, Muay
> Thai, festivals, and more
> • 355 lessons with rising difficulty, checkpoints, and mastery stars
> • Adapts to you: total beginners always see easy romanized pronunciation;
> advanced learners graduate to real Thai script
> • Hear every word — native Thai text-to-speech in every lesson
> • Learn to WRITE: watch every letter draw itself, then trace it with your
> finger and get an instant accuracy score
> • Smart reviews: spaced repetition resurfaces words right before you forget
> them
> • Illustrated reader and a 16-category phrasebook with tap-to-translate
> • Streaks, XP, gems, rewards, unlockable pixel avatars, and a global
> leaderboard
> • Cloud backup: link your email and your progress follows you to any device
>
> **FREE TO LEARN**
> The core course is free. Premium removes the hearts limit and unlocks every
> world.
>
> Whether you're planning a trip to Thailand, talking with family, or falling
> in love with the language — start with one lesson. It's sanuk. 🐘

## Keywords (iOS, 100 chars — no spaces after commas)

```
learn thai,thai language,speak thai,thai alphabet,thailand,thai words,study thai,thai writing
```

Play Console has no keyword field — the short + long description above
already carry the key phrases naturally ("learn Thai", "Thai alphabet",
"speak", "writing", "Thailand").

## Promotional text (iOS, 170 chars — editable without review)

> New: 45 learning worlds, a Thai handwriting trainer with instant accuracy
> scores, and cloud sync. Start your streak today — the first lessons take
> two minutes.

## Screenshot plan (6–8 shots, portrait, device frames optional)

Order tells the story: fun → depth → proof.

1. **Learn path** (Learn tab, world 1 visible) — caption: *"Climb 45 worlds of bite-sized lessons"*
2. **Quiz question** (meaning mode, colorful choices) — *"3,100+ real-world words"*
3. **Writing trainer — trace mode** mid-trace with accuracy score — *"Learn to write the Thai alphabet"*
4. **Level picker** (onboarding) — *"Adapts to your level, from day one"*
5. **Reader / phrasebook** — *"Read real Thai with tap-to-translate"*
6. **Leaderboard** with pixel avatars/flags — *"Compete with learners worldwide"*
7. **Profile with streak/rewards** — *"Streaks, stars, and rewards keep you coming back"*

Take at 1290×2796 (iPhone 15 Pro Max) and 1080×1920 (Play). Use the paper
background, real app state (not mockups), captions set in Pixelify Sans on
ember orange bars — consistent with the icon so the listing reads as one brand.

Feature graphic (Play, 1024×500): paper background, pixel elephant left,
"Sanuk Thai — Learn Thai the fun way." in brand type right. The og.png
composition (public/og.png) is the template — same layout, resized.

## Voice & tone rules

- Warm, playful, concrete. Say "trace it with your finger", not "utilize
  handwriting recognition technology".
- Numbers sell: 3,100+ words, 45 worlds, 355 lessons — keep them current
  (re-run `node scripts/validate-vocab.mjs` for the live word count).
- Never promise fluency timelines ("fluent in 30 days") — app stores flag it
  and it's not true.
- Thai script in marketing text is fine (สนุก) but always paired with the
  romanization.
