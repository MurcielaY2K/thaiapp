# 🐾 Petagotchi

> Tamagotchi meets AI personalization meets modern mobile addiction.

Transform your real-life pet into an adorable animated pixel creature and raise it as your digital companion!

## Features

- **AI Pet Transformation** — Upload a pet photo and get a charming 8-bit pixel-art version
- **Digital Pet Care** — Feed, sleep, play, wash, walk, train & hug your pet
- **Evolution System** — 6 stages from egg → legend based on care quality
- **Personality Engine** — 8 unique AI-assigned personalities (lazy, chaotic, affectionate...)
- **Mini Games** — Treat Catch, Retro Race, Fishing, Puzzle, Dance Battle, Pixel Rush
- **Social Features** — Visit friends, leaderboards, daily challenges
- **Customization** — Hats, outfits, room themes, pixel art styles
- **Neglect System** — Leave your pet alone too long and it becomes a grumpy gremlin!

## Tech Stack

- **React Native** with **Expo** (iOS + Android)
- **Expo Router** (file-based navigation)
- **Zustand** (state management)
- **React Native Reanimated** (animations)
- **AsyncStorage** (cloud-ready local persistence)
- **TypeScript** throughout

## Getting Started

```bash
npm install
npx expo start
```

## Project Structure

```
app/
  (tabs)/       # Main tab screens (Home, Care, Games, Social, Shop)
  modals/       # Onboarding, Evolution reveal, Settings
components/
  pixel/        # PixelPet, PixelBackground, PixelText, RetroFrame
  care/         # StatsBar, MoodBubble, CareButton
  ui/           # RetroButton
constants/      # Colors, pet data, evolutions
store/          # Zustand pet store
types/          # TypeScript types
```

## Visual Style

- 90s Japanese Tamagotchi aesthetics
- Deep purple/dark retro base colors
- Neon pink, cyan, purple & yellow accents
- Soft pastel highlights
- Pixel art sprite rendering via View grids
- CRT-inspired UI with glow effects
