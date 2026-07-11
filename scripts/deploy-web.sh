#!/usr/bin/env bash
# One-command web release: stamp version → build → publish to GitHub Pages.
#
#   npm run deploy:web
#
# Every open copy of the app polls version.json and shows an "Update ready"
# prompt within minutes of this finishing, so users converge on the new build
# without doing anything manually. See docs/UPDATES.md.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain)" ]; then
  echo "✗ Working tree not clean — commit or stash first." >&2
  exit 1
fi

echo "→ Validating…"
npx tsc --noEmit
node scripts/validate-vocab.mjs

echo "→ Building (stamps constants/version.ts + public/version.json)…"
npm run build:web

# The freshly stamped version files belong to this release's history.
if [ -n "$(git status --porcelain constants/version.ts public/version.json)" ]; then
  git add constants/version.ts public/version.json
  git commit -m "release: $(node -p "require('./public/version.json').buildId")"
fi

echo "→ Publishing dist/ to gh-pages…"
git add -f dist
git commit -m "build: deploy"
SPLIT=$(git subtree split --prefix=dist HEAD)
git push origin "$SPLIT":gh-pages --force
git reset --hard HEAD~1   # drop the temp dist commit; the release commit stays

echo "→ Pushing source…"
git push origin HEAD
git push origin HEAD:main || echo "⚠ main not fast-forwardable — push it manually."

echo "✓ Deployed $(cat public/version.json)"
echo "  Live users will see the update prompt within ~5 minutes (or on next app focus)."
