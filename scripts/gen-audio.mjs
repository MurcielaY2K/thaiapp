// Batch-generate near-native Thai audio for every word used in lessons
// (plus alphabet names) with a neural TTS, into public/audio/*.mp3 +
// public/audio/manifest.json. The app plays these instead of the device's
// robotic Web Speech voice wherever they exist (lib/audio.ts).
//
// One-time setup (either provider):
//   Google:  export GOOGLE_TTS_KEY=...   (Cloud Text-to-Speech API key)
//   Azure:   export AZURE_TTS_KEY=... AZURE_TTS_REGION=southeastasia
// Then:      node scripts/gen-audio.mjs
// Cost: ~1,500 short clips ≈ well inside both providers' free tiers.
// Re-runs skip files that already exist, so it's resumable and incremental.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'public/audio');
mkdirSync(OUT, { recursive: true });

// ── collect the Thai strings that matter most (lesson words first) ─────────
function extract(file, regex) {
  const src = readFileSync(join(root, file), 'utf8');
  return [...src.matchAll(regex)].map(m => m[1]);
}
// ids used by lessons
const vocabIds = new Set(extract('data/worlds.ts', /'((?:w\d+[a-z]?-)?[a-z]+\d+|[a-z]+\d+)'/g));
// id -> th from the vocabulary db
const vocabSrc = readFileSync(join(root, 'data/vocabulary.ts'), 'utf8');
const wordRe = /id:\s*'([^']+)'\s*,\s*th:\s*'([^']+)'/g;
const lessonWords = [];
const otherWords = [];
for (const m of vocabSrc.matchAll(wordRe)) {
  (vocabIds.has(m[1]) ? lessonWords : otherWords).push(m[2]);
}
// alphabet character names (what the writing trainer speaks)
const alphaNames = extract('data/alphabet.ts', /thName:\s*'([^']+)'/g);

// Full sentences + their word tokens from the phrasebook and reading lessons.
// Sentences are spoken in checkpoint phrase questions (keyed by the tokens
// joined, exactly as lesson.tsx builds them); tokens drive the read-along.
function extractSentences(file) {
  const src = readFileSync(join(root, file), 'utf8');
  const sentences = [];
  const tokens = [];
  for (const m of src.matchAll(/tokens:\s*\[([\s\S]*?)\]/g)) {
    const toks = [...m[1].matchAll(/th:\s*'([^']+)'/g)].map(x => x[1]);
    if (toks.length === 0) continue;
    sentences.push(toks.join(''));
    tokens.push(...toks);
  }
  return { sentences, tokens };
}
const phrases = extractSentences('data/phrases.ts');
// reading.ts sentences reference a shared word dict (tokens: [W.chan, ...]),
// so full sentences need the refs resolved; the dict's `th:` values are also
// the words the tap-a-word gloss speaks.
function extractReadingSentences() {
  const src = readFileSync(join(root, 'data/reading.ts'), 'utf8');
  const dict = {};
  for (const m of src.matchAll(/(\w+):\s*\{ th: '([^']+)'/g)) dict[m[1]] = m[2];
  const sentences = [];
  for (const m of src.matchAll(/tokens:\s*\[([^\]]+)\]/g)) {
    const toks = [...m[1].matchAll(/W\.(\w+)/g)].map(x => dict[x[1]]).filter(Boolean);
    if (toks.length) sentences.push(toks.join(''));
  }
  return sentences;
}
const readingSentences = extractReadingSentences();
const readingTokens = extract('data/reading.ts', /th:\s*'([^']+)'/g);

const texts = [...new Set([
  ...alphaNames, ...lessonWords,
  ...phrases.sentences, ...readingSentences,
  ...phrases.tokens, ...readingTokens,
  ...otherWords,
])];
const LIMIT = Number(process.env.AUDIO_LIMIT ?? 5000); // top-priority subset
const batch = texts.slice(0, LIMIT);
console.log(`Total unique strings: ${texts.length}; generating first ${batch.length}`);

// ── TTS providers ───────────────────────────────────────────────────────────
const GOOGLE_KEY = process.env.GOOGLE_TTS_KEY;
const AZURE_KEY = process.env.AZURE_TTS_KEY;
const AZURE_REGION = process.env.AZURE_TTS_REGION ?? 'southeastasia';

async function googleTTS(text) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'th-TH', name: 'th-TH-Neural2-C' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 },
    }),
  });
  if (!res.ok) throw new Error(`google ${res.status}: ${await res.text()}`);
  return Buffer.from((await res.json()).audioContent, 'base64');
}

async function azureTTS(text) {
  const ssml = `<speak version='1.0' xml:lang='th-TH'><voice name='th-TH-PremwadeeNeural'><prosody rate='-10%'>${text}</prosody></voice></speak>`;
  const res = await fetch(`https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_KEY,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
    },
    body: ssml,
  });
  if (!res.ok) throw new Error(`azure ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

const tts = GOOGLE_KEY ? googleTTS : AZURE_KEY ? azureTTS : null;
if (!tts) {
  console.error('No TTS key found. Set GOOGLE_TTS_KEY or AZURE_TTS_KEY (+AZURE_TTS_REGION).');
  console.error('See docs/LAUNCH_PLAN.md → "Native-quality audio".');
  process.exit(1);
}

// ── generate ────────────────────────────────────────────────────────────────
const manifestPath = join(OUT, 'manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
let made = 0, skipped = 0, failed = 0;
for (const text of batch) {
  const file = createHash('sha1').update(text).digest('hex').slice(0, 12) + '.mp3';
  if (manifest[text] && existsSync(join(OUT, file))) { skipped++; continue; }
  try {
    const buf = await tts(text);
    writeFileSync(join(OUT, file), buf);
    manifest[text] = file;
    made++;
    if (made % 50 === 0) {
      writeFileSync(manifestPath, JSON.stringify(manifest));
      console.log(`…${made} generated`);
    }
  } catch (e) {
    failed++;
    console.error(`FAIL "${text}": ${String(e).slice(0, 120)}`);
    if (failed > 20) { console.error('Too many failures — aborting.'); break; }
  }
}
writeFileSync(manifestPath, JSON.stringify(manifest));
console.log(`Done: ${made} new, ${skipped} existing, ${failed} failed. Manifest: ${Object.keys(manifest).length} entries.`);
console.log('Deploy with: npm run deploy:web');
