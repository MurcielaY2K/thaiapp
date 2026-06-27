# ภาษาไทย — Thai Learning App · Developer Handover

A mobile-first **Thai language learning** web app: spaced-repetition vocabulary
quizzes, an interactive alphabet writing trainer (watch + trace with an
accuracy scanner), and an illustrated reading / phrasebook section with
text-to-speech. Built with Expo + React Native Web and shipped as a static
PWA to GitHub Pages.

**Live:** https://murcielay2k.github.io/thaiapp/

---

## 1. Tech stack

| Layer            | Choice |
|------------------|--------|
| Framework        | Expo SDK **51** (`expo` ~51.0.28), React Native **0.74.5**, React **18.2** |
| Web renderer     | `react-native-web` ^0.21 |
| Routing          | `expo-router` ~3.5 (file-based, in `app/`) |
| State            | `zustand` ^4.5 (single store) |
| Persistence      | `@react-native-async-storage/async-storage` (→ localStorage on web) |
| Language         | TypeScript ~5.3 |
| Animation        | RN `Animated`, plus HTML Canvas 2D for the writing trainer |
| Audio            | Web Speech API (`SpeechSynthesis`, `lang: 'th-TH'`) |
| Haptics          | `expo-haptics` (native only) |
| Deploy target    | GitHub Pages (static export), PWA via service worker |

> Note: although many `expo-*` packages are installed (av, notifications,
> image-picker, etc.), the current feature set primarily uses async-storage,
> haptics, router and the Web Speech API. Unused deps can be pruned.

---

## 2. Project structure

```
app/                      # expo-router screens (file-based routing)
  _layout.tsx             # Stack navigator + per-route transitions
  index.tsx               # Home: streak, stats, 3 mode cards, pixel-art scene
  session.tsx             # SRS vocabulary quiz (multiple choice)
  write.tsx               # Alphabet trainer host (Watch / Trace modes)
  read.tsx                # Reading stories + phrasebook with TTS
  +html.tsx               # Custom HTML document shell for web export
components/
  PixelSprite.tsx         # Renders a pixel-art sprite from a color grid (View-based)
  StrokeAnimation.tsx     # "Watch" mode — animated write-on reveal of the glyph
  TraceCanvas.tsx         # "Trace" mode — canvas drawing + accuracy scanner
data/
  vocabulary.ts           # 180 words (th, rom, en, category)
  alphabet.ts             # 44 consonants + 24 vowels + 10 numerals
  phrases.ts              # 16 phrase categories of glossed context sentences
  reading.ts              # 5 illustrated reading lessons (scene + sentences)
  sprites.ts              # ~40 pixel-art sprite definitions
  strokes.ts              # (legacy stroke-path data; superseded by font reveal)
store/
  srsStore.ts             # zustand store: SRS, writing progress, streak
constants/
  colors.ts               # Dark theme palette
public/
  service-worker.js       # PWA offline caching
```

---

## 3. Data models

```ts
// data/vocabulary.ts
interface Word { id: string; th: string; rom: string; en: string; category: string; }

// data/alphabet.ts
type CharType = 'consonant' | 'vowel' | 'number';
interface ThaiChar {
  id: string; char: string;
  name: string;    // romanized traditional name, e.g. "ko kai"
  thName: string;  // Thai-script name for native TTS, e.g. "ก ไก่"
  meaning: string; sound: string; type: CharType;
}

// data/reading.ts
interface Token    { th: string; rom: string; en: string; }      // one glossed word
interface Sentence { tokens: Token[]; en: string; }              // sentence + translation
interface ReadingLesson {
  id: string; title: string; titleEn: string;
  scene: { sprite: SpriteName; size: number; opacity?: number }[];
  sentences: Sentence[];
}

// data/phrases.ts
interface PhraseCategory {
  key: string; th: string; label: string; icon: string;
  sentences: Sentence[];   // reuses the reading Sentence/Token shape
}
```

---

## 4. State & SRS (`store/srsStore.ts`)

Single zustand store, persisted to three AsyncStorage keys:

- `@thaiapp_progress` — per-word SRS records `{ interval, dueDate, ease, reviews }`
- `@thaiapp_writing` — per-character practice counts `{ [charId]: number }`
- `@thaiapp_streak` — `{ streak, lastStudyDay }`

**SRS algorithm** (SM-2-lite): correct → `interval *= ease` (ease clamped
1.3–2.5, +0.1 on hit); wrong → `interval = 1`, ease −0.2. `dueDate = now +
interval days`. A word is "mastered" once `reviews ≥ 3 && interval ≥ 7`.

**Sessions**: up to 20 cards, due words first, then unseen words, shuffled.

**Streak**: `bumpStreak()` (called on session completion) increments when the
last study day was yesterday, resets to 1 otherwise, and is a no-op if already
bumped today.

---

## 5. Key features & how they work

### Home (`index.tsx`)
Animated (bobbing) pixel-art mascot, 🔥 streak banner, stats row (due /
mastered / written), three mode cards (Study / Write / Read), and a decorative
pixel-art skyline that bleeds to the screen edges.

### Vocabulary quiz (`session.tsx`)
Multiple-choice (1 correct + 3 distractors). On card appear, the Thai word is
**auto-spoken** (TTS) and a card spring animation plays. The romanization is
hidden until the user answers, then revealed (reward on correct / teach on
wrong). Tracks a **combo streak** (🔥 N) and shows a ⭐ 1–3 star rating + score
% on the done screen. Haptics on native.

### Alphabet trainer (`write.tsx` + 2 components)
Tabs for Consonants / Vowels / Numbers; two modes per character:

- **Watch** (`StrokeAnimation.tsx`): rather than hand-authored stroke paths
  (which never matched the real glyphs), it animates a left→right "write-on"
  reveal of the **actual font glyph** on a `<canvas>`. Guaranteed correct for
  every character. Auto-loops after a short pause.
- **Trace** (`TraceCanvas.tsx`): the user traces over a ghost glyph using
  Pointer Events (`touch-action: none` + `setPointerCapture` so the page
  doesn't pan). A **"Check" accuracy scanner** then sweeps left→right: it
  rasterizes a thick "acceptance zone" of the target glyph and the user's ink
  to off-screen canvases, compares per-column coverage, and animates a
  hit/miss color overlay, ending in a forgiving 0–100% score (finger tracing
  is imprecise, so the curve is generous). ✨ celebration on ≥65%.

Glyph font size auto-scales via `measureText` so wide multi-codepoint vowels
(e.g. เอะ) fit the canvas without clipping. The "Listen" button and on-change
auto-speak use the **Thai-script name** (`thName`) with a Thai voice for
natural pronunciation.

### Reading & phrases (`read.tsx`)
Horizontal tab bar: 📜 Stories (5 illustrated lessons) + 16 phrase categories.
Each sentence is a row of tappable glossed words. Tap a word → hear it + see
romanization/meaning in the word bar. Toggles for Phonetic and Translate.
**"Read all"** plays the whole passage word-by-word, **highlighting each token
as it's spoken** (sequential `SpeechSynthesisUtterance`s chained on `onend`),
with a **speed control** (0.5× / 0.75× / 1×) and a Stop button.

### Pixel art (`PixelSprite.tsx`, `data/sprites.ts`)
Sprites are defined as arrays of color rows and rendered as a grid of `View`s
(no image assets), keeping the bundle light and the aesthetic consistent.

---

## 6. Build & deploy

```bash
npm install
npm run web          # local dev (expo start --web)
npm run build:web    # static export → dist/
```

`build:web` runs `expo export --platform web`, then post-processes `dist/`:
adds `.nojekyll`, copies the service worker, and rewrites asset paths to the
`/thaiapp` base (GitHub Pages subpath). The base path is configured in
`app.json` via `experiments.baseUrl: "/thaiapp"`.

**Deploy** (publishes `dist/` to the `gh-pages` branch via subtree split).

`dist/` is **git-ignored** — it is build output and is never committed to the
source branch. The deploy uses a *throwaway* build commit purely so
`git subtree split` has the directory in its tree, then drops it again:

```bash
npm run build:web

# 1. commit your real source changes first (data, components, etc.)
git add data/ components/ && git commit -m "vocab: ..."

# 2. throwaway build commit (force-add the ignored dist/), then split & push
git add -f dist && git commit -m "build (temporary, will be dropped)"
SPLIT="gh-pages-split-v$(date +%s)"
git subtree split --prefix dist HEAD -b "$SPLIT"
git push origin "$SPLIT:gh-pages" --force

# 3. drop the throwaway build commit so source stays clean, then push source
git reset --hard HEAD~1
git branch -D "$SPLIT"
git push origin main
```

After deploy, hard-refresh on mobile to bust the service-worker cache.

Active development branch: `main` (the cleaned, canonical project). The earlier
`claude/petagotchi-mobile-app-uxmMy` branch has been superseded by `main`.

---

## 7. Gotchas / notes for the next developer

- **TTS is browser-dependent.** `lang: 'th-TH'` quality varies by OS/browser;
  a Thai system voice must be installed for natural output. There is no
  bundled audio — everything goes through the Web Speech API, so audio is
  web-only (the `speak()` helpers early-return on native).
- **Thai has no inter-word spaces.** Word boundaries in reading data are
  defined manually via the `tokens` array; this is what powers tap-to-gloss
  and the word-by-word read-along highlight.
- **Canvas work is web-only.** `StrokeAnimation` and `TraceCanvas` have RN
  fallbacks for native (`Platform.OS !== 'web'`) but the rich
  watch/scan/celebrate experience is implemented on `<canvas>`.
- **Romanization** is hand-written with tone marks and is approximate; it's a
  learning aid, not a strict phonemic transcription standard.
- The old path-based stroke data (`data/strokes.ts`) has been removed; the
  writing trainer now reveals the real font glyph instead.

---

## 8. Content inventory

- **1,253** vocabulary words across **37** categories, transcribed from a Thai
  phrasebook (basics, numbers, time, family, transport/car/travel, home &
  rooms, housework, and the full "At the Shops" set: food, fruit, vegetables,
  seafood, meat, bakery, dairy, pharmacy, beauty, baby, stationery, department
  store, clothing, tools, …)
- **78** alphabet characters (44 consonants, 24 vowels, 10 numerals), each with
  traditional name (romanized + Thai script), meaning, and practical sound
- **16** phrase categories of glossed context sentences (incl. contemporary:
  slang, movies/series, online/social)
- **5** illustrated reading lessons
- **~40** pixel-art sprites

> Each vocabulary category must be registered in **3** places in
> `components/tabs/DatabaseTab.tsx`: the `CATEGORIES` array, `CAT_EMOJI`, and
> `CAT_COLORS`. Before every build, validate the dataset (no duplicate `id`,
> `th`, or `en`; no Latin letters inside `th`) and run `npx tsc --noEmit`.
