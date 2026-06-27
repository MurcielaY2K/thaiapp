# ภาษาไทย — Thai Learning App

A mobile-first **Thai language learning** app: spaced-repetition vocabulary
quizzes, an interactive alphabet writing trainer (watch + trace with an
accuracy scanner), and an illustrated reading / phrasebook section with
text-to-speech. Built with Expo + React Native Web and shipped as a static
PWA to GitHub Pages.

**Live:** https://murcielay2k.github.io/thaiapp/

## Features

- **Vocabulary SRS** — multiple-choice quizzes with an SM-2-lite spaced
  repetition schedule, combo streaks, and star scoring
- **Alphabet trainer** — *Watch* mode animates a write-on reveal of the real
  font glyph; *Trace* mode lets you trace over a ghost glyph and scores your
  accuracy
- **Reading & phrasebook** — illustrated lessons and 16 phrase categories with
  tap-to-gloss words, Thai text-to-speech, and a word-by-word read-along
- **Pixel-art aesthetic** — lightweight sprites rendered from color grids
- **Progress, streaks & profiles** — daily streaks, XP, leaderboard, and an
  optional Premium tier

## Tech stack

- **Expo SDK 51** · React Native 0.74 · React 18 · TypeScript
- **expo-router** (file-based routing) · **zustand** (state)
- **react-native-web** (web target) · AsyncStorage persistence
- Web Speech API for Thai TTS · Supabase + Stripe for accounts/Premium

## Getting started

```bash
npm install
npm run web          # local dev in the browser (expo start --web)
npm run ios          # iOS simulator
npm run android      # Android emulator
```

## Build & deploy

```bash
npm run build:web    # static web export → dist/ (git-ignored)
```

`dist/` is a build artifact and is **not** committed to source — the published
site lives on the `gh-pages` branch. See **[DEVELOPER.md](./DEVELOPER.md)** for
the full architecture, data models, SRS algorithm, deploy steps, and gotchas.

## Project structure

```
app/         expo-router screens (index, session, write, read, lesson)
components/   UI + tab screens (Learn, Practice, Database, Leaderboard, Profile)
data/         vocabulary, alphabet, phrases, reading, sprites, worlds, rewards
store/        zustand stores (srs, progress, user)
constants/    theme, colors, typography, stripe, supabase config
lib/          supabase client
supabase/     database schema
public/       PWA service worker
assets/       sprite images
```
