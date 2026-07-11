<p align="center">
  <img src="assets/images/icon.png" alt="Sanuk Thai" width="120" height="120" />
</p>

<h1 align="center">Sanuk Thai</h1>

<p align="center"><strong>Learn Thai the fun way.</strong><br/>
3,100+ words · 45 learning worlds · reading & writing practice · global leaderboard</p>

<p align="center">
  <a href="https://murcielay2k.github.io/thaiapp/">🌐 Play now — free in your browser</a>
</p>

---

*Sanuk* (สนุก) means **fun** — the whole point. Sanuk Thai is a game-styled
Thai language course with a hand-crafted pixel-art world: you climb a path of
bite-sized lessons, earn XP and stars, keep a streak alive, and compete on a
global leaderboard while actually learning to speak, read, and write Thai.

## The product

| | |
|---|---|
| 📚 **3,100+ word curriculum** | 45 themed worlds / 355 lessons with rising difficulty, checkpoints, and mastery stars |
| 🎯 **Adapts to your level** | Beginners always get romanized pronunciation; advanced learners read real Thai script |
| 🗣️ **Listening & speaking** | Native text-to-speech on every word and four quiz challenge types |
| ✍️ **Writing trainer** | Watch every consonant, vowel, and numeral draw itself — then trace it and get an accuracy score |
| 📖 **Reader & phrasebook** | Illustrated stories and 16 phrase categories with tap-to-gloss and read-along |
| ☁️ **Cloud sync** | Link an email and progress follows you across devices |
| 👾 **Pixel-art everything** | Original sprites, avatars, flags, and UI — no stock assets |

**Business model:** free core course; Premium subscription (unlimited hearts +
all worlds) — server-verified entitlements via Stripe today, App Store /
Google Play billing when store builds ship.

## Tech

Expo SDK 51 · React Native 0.74 / React 18 · TypeScript · expo-router ·
zustand · react-native-web PWA · Supabase (auth, sync, leaderboard,
entitlements) · Stripe (web billing) · GitHub Pages (static deploy).

```bash
npm install
npm run web           # local development
npm run build:web     # static export → dist/
npm run deploy:web    # one-command release (see docs/UPDATES.md)
```

## Documentation

| Doc | What's inside |
|---|---|
| [DEVELOPER.md](./DEVELOPER.md) | Architecture, data models, SRS algorithm, deploy pipeline |
| [docs/UPDATES.md](./docs/UPDATES.md) | How releases reach every user (web + future store builds) |
| [docs/STORE_LISTING.md](./docs/STORE_LISTING.md) | App Store / Play submission: compliance, data-safety forms |
| [docs/STORE_COPY.md](./docs/STORE_COPY.md) | Store listing copy: descriptions, keywords, screenshot plan |
| [docs/AUDIT.md](./docs/AUDIT.md) | Security & quality audit (July 2026) |
| [docs/PAYMENTS_SETUP.md](./docs/PAYMENTS_SETUP.md) | Stripe webhook + entitlements deployment |

**Legal:** [Privacy](https://murcielay2k.github.io/thaiapp/privacy) ·
[Terms](https://murcielay2k.github.io/thaiapp/terms) ·
[Refunds](https://murcielay2k.github.io/thaiapp/refunds) ·
[Account deletion](https://murcielay2k.github.io/thaiapp/delete-account)

## License

Proprietary — all rights reserved. See [LICENSE](./LICENSE).
