import OpenAI from 'openai';
import { TranscriptionResult, WordTimestamp } from '../types/pronunciation';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI();
  }
  return _client;
}

/** Exposed for testing — swap in a mock client */
export function setOpenAIClient(client: OpenAI): void {
  _client = client;
}

// ─── Transcription ────────────────────────────────────────────────────────────

/**
 * Transcribe a Thai audio buffer using OpenAI Whisper.
 *
 * @param audioBuffer   Raw audio bytes (WAV, MP3, M4A, WebM, etc.)
 * @param filename      Filename hint so Whisper knows the format (e.g. "audio.webm")
 * @param expectedThai  Optional expected text — passed as a Whisper prompt to
 *                      reduce hallucination on single-word inputs
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string,
  expectedThai?: string,
): Promise<TranscriptionResult> {
  const client = getClient();
  const start = Date.now();

  // Copy to a plain ArrayBuffer to satisfy strict File constructor typing
  const ab = audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength) as ArrayBuffer;
  const file = new File([ab], filename, { type: inferMimeType(filename) });

  const response = await client.audio.transcriptions.create({
    model: 'whisper-1',
    file,
    language: 'th',
    response_format: 'verbose_json',
    timestamp_granularities: ['word'],
    prompt: expectedThai ? `Thai word: ${expectedThai}` : undefined,
  });

  const durationMs = Date.now() - start;

  const words: WordTimestamp[] = (response.words ?? []).map(w => ({
    word: w.word,
    start: w.start,
    end: w.end,
    confidence: (w as { probability?: number }).probability ?? 1,
  }));

  return {
    text: response.text.trim(),
    words,
    language: response.language ?? 'th',
    durationMs,
  };
}

// ─── Phoneme match scoring ────────────────────────────────────────────────────

/**
 * Score phoneme similarity between what Whisper heard and what was expected.
 * Uses character-level Levenshtein ratio on the Thai script.
 *
 * Returns 0–100.
 */
export function scorePhonemeMatch(transcribed: string, expected: string): number {
  const t = transcribed.trim().toLowerCase();
  const e = expected.trim().toLowerCase();
  if (t === e) return 100;
  if (t.length === 0 || e.length === 0) return 0;

  const dist = levenshtein(t, e);
  const maxLen = Math.max(t.length, e.length);
  const ratio = 1 - dist / maxLen;
  return Math.round(Math.max(0, ratio) * 100);
}

/**
 * Score whether the transcription matches the expected Thai word at all.
 * Full credit if the transcription contains the expected word; partial for partial match.
 *
 * Returns 0–100.
 */
export function scoreTranscriptionMatch(transcribed: string, expected: string): number {
  const t = transcribed.trim();
  const e = expected.trim();
  if (t === e) return 100;
  if (t.includes(e) || e.includes(t)) return 80;
  // Fall back to character overlap
  return scorePhonemeMatch(t, e);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function inferMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    wav: 'audio/wav',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    webm: 'audio/webm',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
  };
  return map[ext ?? ''] ?? 'audio/webm';
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}
