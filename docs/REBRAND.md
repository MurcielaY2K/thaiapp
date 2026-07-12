# Renaming the repo & making it private — read before clicking

Two GitHub-settings changes were requested: rename `thaiapp` → something
branded, and make the repo private. **Both have side effects on the live
app.** This is the decision guide; the actual clicks are owner-only.

## ⚠️ The two traps

1. **Private repo kills the live site.** GitHub Pages on a free account only
   publishes from PUBLIC repos. We already hit this once (July 2026): the repo
   was flipped private and the app went down for every user until it was made
   public again. Nothing in the repo is secret (audited — the Supabase anon
   key is public by design), so "public" costs nothing except visibility of
   the source.

2. **Renaming changes the live URL.** The site lives at
   `murcielay2k.github.io/<repo-name>/`. Rename the repo and the URL moves;
   the old URL 404s. That breaks: every user's bookmark and home-screen app,
   the Supabase auth redirect URLs, the Stripe payment-link redirect, the OG
   image links, and the `/thaiapp` base path baked into the build. Git
   remotes redirect after a rename — **Pages URLs do not**.

## Recommended path

**Now (pre-launch, small user base):** rename to `sanuk-thai`, keep it
public. Coordinate the rename with a same-day code change (see checklist) so
the site comes right back up at the new, branded URL:
`https://murcielay2k.github.io/sanuk-thai/`.

**At launch (the real fix for both wishes):** buy **sanukthai.com** (or
.app) and serve the web app from it. A custom domain:
- looks professional on every share card, store listing, and email,
- makes the underlying repo name invisible to users (rename becomes a
  non-event), and
- if you also want the repo private, move static hosting to Cloudflare
  Pages or Netlify (both free tiers deploy from private GitHub repos), or
  upgrade to GitHub Pro (paid) which allows Pages from private repos.

Until there's a custom domain, keeping the repo public is the only free way
to keep the app online on GitHub Pages.

## Rename checklist — ✅ COMPLETE (July 2026)

Live at **https://murcielay2k.github.io/sanuk-thai/**. Everything done:

- [x] Code/config: base path, build rewrites, OG/social URLs, service-worker
      path, update checker, auth redirect URL, legal/docs links — every
      `/thaiapp` path migrated to `/sanuk-thai`. Local storage keys
      (`@thaiapp_*`) deliberately unchanged, so no user lost progress.
- [x] GitHub → repo renamed to `sanuk-thai`.
- [x] Supabase → Authentication → URL Configuration → Site URL + Redirect
      URLs → new URL.
- [x] Stripe Payment Link → after-payment redirect → new URL.
- [x] Verified live and working end to end.

If any user still has the old home-screen icon installed, it now 404s —
they need to open the new URL in Safari/Chrome once and re-add it.

## Private + custom domain — IN PROGRESS (Cloudflare Pages)

Chosen path: **sanukthai.com on Cloudflare Pages**, repo goes private once
that's verified live. The codebase is already dual-target — the same source
builds for the current GitHub Pages subpath (`build:web`, unchanged, still
the live default) or a Cloudflare Pages root deploy (`build:web:root`) — so
this whole migration happens with **zero downtime** on the existing site.

### Status
- [x] Code: dual-target build (`app.config.js` + `scripts/build-web.sh`),
      verified both targets end-to-end.
- [ ] Buy the domain.
- [ ] Connect Cloudflare Pages to the repo, verify on the free `*.pages.dev`
      URL.
- [ ] Attach the custom domain, verify on `sanukthai.com`.
- [ ] Cut over: update Supabase/Stripe redirect URLs, tell users to re-add
      the home-screen icon.
- [ ] Make the GitHub repo private.
- [ ] (Optional) stop the GitHub Pages deploy once the domain is proven.

### 1. Buy the domain
Any registrar works. Cloudflare Registrar (sells at cost, ~$10/yr) is the
simplest pairing since hosting is also Cloudflare — one dashboard for both.
Namecheap/Porkbun/Google Domains work identically otherwise. Buy
`sanukthai.com` (or `.app`/`.co` if taken).

### 2. Connect Cloudflare Pages to the repo
Cloudflare dashboard → **Workers & Pages** → **Create application** →
**Pages** → **Connect to Git** → authorize the Cloudflare GitHub App on
`MurcielaY2K/sanuk-thai` (works whether the repo is public or private — no
need to touch repo visibility yet). Build settings:

| Field | Value |
|---|---|
| Build command | `npm run build:web:root` |
| Build output directory | `dist` |
| Root directory | `/` (default) |
| Environment variable | `SITE_ORIGIN` = `https://sanukthai.com` (set this even before the domain is attached — Cloudflare Pages ignores it until then, and it's one less thing to remember later) |

Deploy. Cloudflare gives a free `<project>.pages.dev` URL immediately —
**verify the full app there first** (profile creation, a lesson, the legal
pages) before touching DNS or Supabase. This is a safe dry run: nothing
about the live GitHub Pages site changes.

### 3. Attach the domain + DNS
Cloudflare Pages project → **Custom domains** → **Set up a custom domain** →
enter `sanukthai.com` → Cloudflare auto-creates the correct DNS records if
the domain's nameservers point at Cloudflare (it will prompt you to switch
nameservers at your registrar if they don't — takes a few hours to
propagate, no downtime for the old site in the meantime). Free SSL is
automatic. Also add `www.sanukthai.com` as a second custom domain with a
redirect to the apex, if desired.

### 4. Cut over (same day, once sanukthai.com loads the app)
1. Supabase → Authentication → URL Configuration → Site URL + Redirect URLs
   → `https://sanukthai.com/`.
2. Stripe Payment Link → after-payment redirect → `https://sanukthai.com/?payment_success=1`.
3. Update `app/+html.tsx`'s default `SITE_ORIGIN` fallback and README/docs
   links to `sanukthai.com` (ask Claude — same pattern as the repo rename).
4. Tell users (there aren't many yet) to reopen the app at the new domain
   and re-add the home-screen icon.
5. GitHub Pages can keep serving `/sanuk-thai/` as a harmless fallback, or
   be turned off (Settings → Pages → disable) once you're confident.

### 5. Make the repo private
Only after `sanukthai.com` is confirmed working: GitHub → repo → Settings →
General → Danger Zone → **Change visibility → Private**. Cloudflare Pages
keeps working (it deploys via the GitHub App, not public HTTP access) —
this is the whole reason the hosting moved before this step.
