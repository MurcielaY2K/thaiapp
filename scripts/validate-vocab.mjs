#!/usr/bin/env node
// Validates data/vocabulary.ts invariants that the quiz logic depends on:
//   - no duplicate id, th, or en values
//   - no Latin letters inside th (Thai script only)
//   - every category is registered in DatabaseTab (CATEGORIES, CAT_EMOJI, CAT_COLORS)
// Exits non-zero with a report if anything fails.

import { readFileSync } from 'node:fs';

const vocabSrc = readFileSync(new URL('../data/vocabulary.ts', import.meta.url), 'utf8');
const tabSrc = readFileSync(new URL('../components/tabs/DatabaseTab.tsx', import.meta.url), 'utf8');

// Match single- or double-quoted values allowing escaped quotes
// (en uses both styles: 'Mother\'s Day' and "I don't understand").
const FIELD = (name) =>
  new RegExp(`${name}:\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`, 'g');

function extract(name) {
  const out = [];
  for (const m of vocabSrc.matchAll(FIELD(name))) {
    const raw = m[1] ?? m[2];
    // Normalize escapes so 'Mother\'s Day' and "Mother's Day" collide as dups.
    out.push(raw.replace(/\\(.)/g, '$1'));
  }
  return out;
}

const ids = extract('id');
const ths = extract('th');
const ens = extract('en');
const cats = extract('category');

const errors = [];

function findDups(list, label) {
  const seen = new Map();
  for (const v of list) seen.set(v, (seen.get(v) ?? 0) + 1);
  for (const [v, n] of seen) if (n > 1) errors.push(`duplicate ${label}: '${v}' (${n}x)`);
}

findDups(ids, 'id');
findDups(ths, 'th');
findDups(ens, 'en');

if (!(ids.length === ths.length && ths.length === ens.length && ens.length === cats.length)) {
  errors.push(`field count mismatch: id=${ids.length} th=${ths.length} en=${ens.length} category=${cats.length}`);
}

for (const th of ths) {
  if (/[A-Za-z]/.test(th)) errors.push(`Latin letters in th: '${th}'`);
}

// Category registration in DatabaseTab
const catList = tabSrc.match(/const CATEGORIES = \[([^\]]+)\]/)?.[1] ?? '';
const registered = new Set([...catList.matchAll(/'([^']+)'/g)].map((m) => m[1]));
const emojiBlock = tabSrc.match(/const CAT_EMOJI[^=]*=\s*\{([\s\S]*?)\n\};/)?.[1] ?? '';
const colorBlock = tabSrc.match(/const CAT_COLORS[^=]*=\s*\{([\s\S]*?)\n\};/)?.[1] ?? '';

for (const cat of new Set(cats)) {
  if (!registered.has(cat)) errors.push(`category '${cat}' missing from CATEGORIES`);
  if (!new RegExp(`(^|[\\s{])${cat}:`).test(emojiBlock)) errors.push(`category '${cat}' missing from CAT_EMOJI`);
  if (!new RegExp(`(^|[\\s{])${cat}:`).test(colorBlock)) errors.push(`category '${cat}' missing from CAT_COLORS`);
}

if (errors.length) {
  console.error(`vocab validation FAILED (${errors.length} problem${errors.length > 1 ? 's' : ''}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`vocab validation OK: ${ids.length} words, ${new Set(cats).size} categories`);
