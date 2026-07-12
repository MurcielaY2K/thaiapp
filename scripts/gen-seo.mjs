// Generates public/robots.txt + public/sitemap.xml, using the same
// BASE_PATH/SITE_ORIGIN env vars as the rest of the dual-target build
// (scripts/build-web.sh) so the URLs are correct whether this is a GitHub
// Pages subpath build or a Cloudflare Pages root-domain build.
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE_PATH = process.env.EXPO_PUBLIC_BASE_PATH ?? '/sanuk-thai';
const SITE_ORIGIN = process.env.EXPO_PUBLIC_SITE_ORIGIN ?? 'https://murcielay2k.github.io';
const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;

writeFileSync(join(root, 'public/robots.txt'),
`User-agent: *
Allow: /
Disallow: /review.html
Disallow: /audio/

Sitemap: ${SITE_URL}/sitemap.xml
`);

const today = new Date().toISOString().slice(0, 10);
const pages = [
  { path: '/', priority: '1.0', freq: 'weekly' },
  { path: '/privacy', priority: '0.3', freq: 'yearly' },
  { path: '/terms', priority: '0.3', freq: 'yearly' },
  { path: '/refunds', priority: '0.3', freq: 'yearly' },
];
const urlset = pages.map((p) =>
  `  <url>\n    <loc>${SITE_URL}${p.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.freq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
).join('\n');

writeFileSync(join(root, 'public/sitemap.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>
`);

console.log(`robots.txt + sitemap.xml written for ${SITE_URL}`);
