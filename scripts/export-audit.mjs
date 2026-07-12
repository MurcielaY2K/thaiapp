// Export the vocabulary for native-speaker review as CSV, lesson words first
// (those are what learners actually drill — review them before the long tail).
//   node scripts/export-audit.mjs   →  docs/audit/vocab-audit.csv
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const worlds = readFileSync(join(root, 'data/worlds.ts'), 'utf8');
const vocab = readFileSync(join(root, 'data/vocabulary.ts'), 'utf8');

const lessonIds = new Set([...worlds.matchAll(/'([a-z]+\d+)'/g)].map(m => m[1]));
const rows = [];
const re = /\{\s*id:\s*'([^']+)',\s*th:\s*'([^']+)',\s*rom:\s*'([^']+)',\s*en:\s*'([^']+)',\s*category:\s*'([^']+)'/g;
for (const m of vocab.matchAll(re)) {
  rows.push({ id: m[1], th: m[2], rom: m[3], en: m[4], cat: m[5], inLessons: lessonIds.has(m[1]) });
}
rows.sort((a, b) => Number(b.inLessons) - Number(a.inLessons));

const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
const csv = ['id,thai,romanization,english,category,used_in_lessons,reviewer_ok,reviewer_correction,reviewer_note']
  .concat(rows.map(r => [r.id, r.th, r.rom, r.en, r.cat, r.inLessons ? 'YES' : '', '', '', ''].map(esc).join(',')))
  .join('\n');

mkdirSync(join(root, 'docs/audit'), { recursive: true });
writeFileSync(join(root, 'docs/audit/vocab-audit.csv'), '﻿' + csv); // BOM so Excel opens Thai correctly
console.log(`Exported ${rows.length} words (${rows.filter(r => r.inLessons).length} lesson words first) → docs/audit/vocab-audit.csv`);
