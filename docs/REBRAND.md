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

## Rename checklist — STATUS: code side EXECUTED (July 2026)

All code/config changes for the `sanuk-thai` rename are done and deployed:
base path, build rewrites, OG/social URLs, service-worker path, update
checker, auth redirect URL, legal/docs links — every `/thaiapp` path is now
`/sanuk-thai`. Local storage keys (`@thaiapp_*`) deliberately unchanged so
nobody loses progress.

Remaining — owner does (GitHub → repo → Settings → General):
1. **Rename repository to `sanuk-thai`.** The moment this is saved, the site
   is live at `https://murcielay2k.github.io/sanuk-thai/`. Until then the
   deployed build is dark (old URL serves new-path assets).

External consoles (owner, same day):
2. Supabase → Authentication → URL Configuration: Site URL + Redirect URLs
    → new URL.
11. Stripe Payment Link → after-payment redirect → new URL.
12. Tell existing users (there aren't many yet) to re-add the home-screen app.

## Private checklist (only when off GitHub Pages)

1. Move hosting (Cloudflare Pages / Netlify from private repo, or GitHub Pro).
2. Verify the new host serves the site (and extensionless routes work).
3. THEN flip the repo private. Never the other order.
