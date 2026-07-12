#!/usr/bin/env bash
# Static web export for either hosting target, selected by $BASE_PATH:
#   BASE_PATH unset/omitted → /sanuk-thai  (GitHub Pages subpath — current live site)
#   BASE_PATH=""            → root         (Cloudflare Pages custom domain)
#
# Called by `npm run build:web` (GH Pages, default) and `npm run build:web:root`
# (Cloudflare Pages). Both produce dist/; only the internal asset paths differ.
set -euo pipefail
cd "$(dirname "$0")/.."

BASE_PATH="${BASE_PATH-/sanuk-thai}"     # ${VAR-default}: only UNSET falls back; BASE_PATH="" stays empty
SITE_ORIGIN="${SITE_ORIGIN-https://murcielay2k.github.io}"
export EXPO_PUBLIC_BASE_PATH="$BASE_PATH"
export EXPO_PUBLIC_SITE_ORIGIN="$SITE_ORIGIN"

node scripts/gen-version.mjs
EXPO_NO_DOCTOR=1 EXPO_OFFLINE=1 expo export --platform web
touch dist/.nojekyll
cp public/service-worker.js dist/service-worker.js

if [ -n "$BASE_PATH" ]; then
  # Subpath deploy: Expo's static export still emits root-absolute asset URLs
  # (/_expo/...), so rewrite them under the subpath. Service-worker
  # registration is handled inside app/+html.tsx itself (env-var driven) —
  # no HTML patching needed for that part.
  find dist -name '*.html' -exec sed -i \
    "s|src=\"/_expo/|src=\"${BASE_PATH}/_expo/|g; s|href=\"/_expo/|href=\"${BASE_PATH}/_expo/|g" {} +
fi

echo "✓ built for BASE_PATH='${BASE_PATH}' SITE_ORIGIN='${SITE_ORIGIN}'"
