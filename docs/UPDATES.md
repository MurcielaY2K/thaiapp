# Shipping updates — how every user gets the new version

## TL;DR: releasing an update (web, today)

```
# optional: bump "version" in package.json for user-visible releases
npm run deploy:web
```

That's it. The script validates (tsc + vocab), builds with a fresh build
stamp, publishes to GitHub Pages, and pushes the source. **Every open copy of
the app detects the new build and shows an "✨ Update ready — UPDATE" prompt**
within ~5 minutes, or instantly the next time the app is opened/foregrounded.
Users who aren't in the app simply get the new version on next launch (the
service worker is network-first — it never pins an old bundle when online).

No user ever loses progress on update: learning state lives in local storage
and (when an email is linked) the Supabase cloud snapshot — both survive
refreshes and reinstalls.

## How it works

1. `scripts/gen-version.mjs` runs inside `npm run build:web` and stamps the
   build twice: `constants/version.ts` (compiled into the bundle = what this
   copy IS) and `public/version.json` (served next to the app = what the
   latest deploy IS).
2. `components/UpdateBanner.tsx` polls `version.json` (launch, on
   foreground, every 5 min, cache-busted). When the served buildId stops
   matching the embedded one, it shows the update prompt; tapping UPDATE
   reloads, and the network-first service worker fetches the new bundle.
3. It never force-reloads — a learner mid-lesson is not interrupted.

The version shown in Profile (`v1.0.0`) comes from `package.json` via the
same stamp, so bump `"version"` there whenever you want users to see a new
number.

## App Store / Google Play builds (when you get there)

Store apps can't be updated by redeploying a website — but you do NOT have to
wait for store review for most changes either:

- **JS/content updates (most of your changes — lessons, vocab, UI, fixes):**
  use **EAS Update** (`npx expo install expo-updates`, `eas update:configure`,
  then `eas update --branch production` to ship). It's the store-app
  equivalent of this repo's web flow: the installed app checks for the new
  JS bundle on launch and applies it. Wire it up when you do the EAS build
  setup (docs/STORE_LISTING.md).
- **Native changes (new SDK, new native module, icon/name changes):** need a
  new binary → `eas build` → store submission and review. Users get it via
  normal store updates; enable "automatic updates" is the default for most
  users.

Rule of thumb once live in stores: every release goes out with
`npm run deploy:web` (web) + `eas update` (installed apps) — same JS, three
platforms, everyone converges on the same version.

## Data compatibility rule for updates

Old clients may run for a few minutes against a new deploy (and store users
for longer). Keep these stable across versions or handle both shapes:
storage keys (`constants/storageKeys.ts`), the cloud snapshot shape
(`lib/progressSync.ts` — versioned with `v: 1`, sanitized on read), and the
Supabase schema (additive migrations only). The snapshot sanitizer already
tolerates unknown/missing fields in both directions.
