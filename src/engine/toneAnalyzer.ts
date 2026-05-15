import { ThaiTone } from '../types';
import {
  PitchContour,
  ToneContourReference,
  ToneAnalysisResult,
  ToneError,
} from '../types/pronunciation';

// ─── Reference tone shapes ────────────────────────────────────────────────────
// Each shape is 10 normalized pitch samples (0=lowest natural pitch, 1=highest).
// Based on Thai linguistic pitch measurements (Abramson 1962, Morén & Zsiga 2006).

export const TONE_REFERENCES: ToneContourReference[] = [
  {
    tone: 'mid',
    shape: [0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50],
    description: 'Flat at mid pitch throughout',
  },
  {
    tone: 'low',
    shape: [0.25, 0.25, 0.23, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.20],
    description: 'Flat at low pitch, very slight fall at end',
  },
  {
    tone: 'falling',
    shape: [0.75, 0.73, 0.68, 0.62, 0.56, 0.50, 0.43, 0.37, 0.32, 0.28],
    description: 'Starts high and falls steadily to low',
  },
  {
    tone: 'high',
    shape: [0.72, 0.75, 0.78, 0.80, 0.82, 0.83, 0.83, 0.82, 0.80, 0.78],
    description: 'Rises slightly then holds high',
  },
  {
    tone: 'rising',
    shape: [0.22, 0.23, 0.26, 0.32, 0.40, 0.50, 0.60, 0.68, 0.75, 0.80],
    description: 'Starts low and rises steadily',
  },
];

// ─── Similarity scoring ───────────────────────────────────────────────────────

/**
 * Cosine similarity between two vectors of equal length.
 * Returns 0–1 (1 = identical direction/shape).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Resample a contour to exactly `targetLength` samples using linear interpolation.
 */
export function resampleContour(contour: PitchContour, targetLength: number): PitchContour {
  if (contour.length === 0) return new Array(targetLength).fill(0);
  if (contour.length === targetLength) return [...contour];

  const result: number[] = [];
  for (let i = 0; i < targetLength; i++) {
    const srcIdx = (i / (targetLength - 1)) * (contour.length - 1);
    const lo = Math.floor(srcIdx);
    const hi = Math.min(lo + 1, contour.length - 1);
    const frac = srcIdx - lo;
    result.push(contour[lo] * (1 - frac) + contour[hi] * frac);
  }
  return result;
}

/**
 * Normalize a contour so min→0, max→1.
 * Flat contours (all same value) are normalized to all-0.5.
 */
export function normalizeContour(contour: PitchContour): PitchContour {
  const min = Math.min(...contour);
  const max = Math.max(...contour);
  if (max - min < 1e-9) return contour.map(() => 0.5);
  return contour.map(v => (v - min) / (max - min));
}

// ─── Tone error classification ────────────────────────────────────────────────

const LEVEL_TONES: ThaiTone[] = ['mid', 'low', 'high'];
const CONTOUR_TONES: ThaiTone[] = ['falling', 'rising'];

function classifyToneError(expected: ThaiTone, detected: ThaiTone | null): ToneError {
  if (!detected) return 'no_pitch_detected';
  const expIsLevel = LEVEL_TONES.includes(expected);
  const detIsLevel = LEVEL_TONES.includes(detected);
  if (expIsLevel !== detIsLevel) return 'wrong_tone_class';
  if (!expIsLevel && !detIsLevel) return 'direction_error'; // falling vs rising
  return 'level_error'; // among mid/low/high
}

// ─── Main analyzer ────────────────────────────────────────────────────────────

/**
 * Analyze a user's pitch contour against an expected Thai tone.
 *
 * @param userContour  Raw pitch samples (Hz or arbitrary units; will be normalized)
 * @param expectedTone The tone the user should have produced
 * @param durationMs   Duration of the spoken syllable in milliseconds
 */
export function analyzeTone(
  userContour: PitchContour,
  expectedTone: ThaiTone,
  durationMs: number,
): ToneAnalysisResult {
  if (durationMs < 80) {
    return {
      expectedTone,
      detectedTone: null,
      similarityScore: 0,
      isCorrect: false,
      errorType: 'too_short',
    };
  }

  if (userContour.length < 3) {
    return {
      expectedTone,
      detectedTone: null,
      similarityScore: 0,
      isCorrect: false,
      errorType: 'no_pitch_detected',
    };
  }

  const normalized = normalizeContour(resampleContour(userContour, 10));

  // Score against every reference tone
  const scores = TONE_REFERENCES.map(ref => ({
    tone: ref.tone,
    score: cosineSimilarity(normalized, ref.shape),
  }));

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const detectedTone = best.tone;

  // Similarity to the *expected* tone specifically
  const expectedRef = TONE_REFERENCES.find(r => r.tone === expectedTone)!;
  const similarityScore = cosineSimilarity(normalized, expectedRef.shape);

  const isCorrect = detectedTone === expectedTone && similarityScore >= 0.85;
  const errorType: ToneError | null = isCorrect
    ? null
    : similarityScore >= 0.7
    ? 'contour_error'
    : classifyToneError(expectedTone, detectedTone);

  return {
    expectedTone,
    detectedTone,
    similarityScore,
    isCorrect,
    errorType,
  };
}

/**
 * Convert a similarity score (0–1) to a 0–100 tone score,
 * applying a curve that rewards near-perfect alignment more than linear.
 */
export function toneScoreFromSimilarity(similarity: number): number {
  // Quadratic curve: score = 100 * sim^1.5 (penalizes mediocre matches)
  return Math.round(100 * Math.pow(Math.max(0, similarity), 1.5));
}
