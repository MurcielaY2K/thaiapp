import { ThaiTone } from './index';

// ─── Tone contour analysis ────────────────────────────────────────────────────

/** Pitch value samples normalized to 0–1 range over a syllable's duration */
export type PitchContour = number[];

export interface ToneContourReference {
  tone: ThaiTone;
  /** Canonical shape: array of 10 normalized pitch samples */
  shape: PitchContour;
  description: string;
}

export interface ToneAnalysisResult {
  expectedTone: ThaiTone;
  detectedTone: ThaiTone | null;
  similarityScore: number; // 0–1
  isCorrect: boolean;
  errorType: ToneError | null;
}

export type ToneError =
  | 'wrong_tone_class'    // completely different tone (e.g., low instead of high)
  | 'direction_error'     // rising vs falling confusion
  | 'level_error'         // confusing mid/low/high level tones
  | 'contour_error'       // shape partially right but pitch level off
  | 'too_short'           // syllable too brief to score reliably
  | 'no_pitch_detected';  // silent or too quiet

// ─── Whisper transcription ────────────────────────────────────────────────────

export interface WordTimestamp {
  word: string;
  start: number; // seconds
  end: number;
  confidence: number;
}

export interface TranscriptionResult {
  text: string;
  words: WordTimestamp[];
  language: string;
  durationMs: number;
}

// ─── Pronunciation scoring ────────────────────────────────────────────────────

export interface PronunciationScores {
  /** How well the tone contour matched (0–100) */
  toneScore: number;
  /** Phoneme-level match based on transcription similarity (0–100) */
  phonemeScore: number;
  /** Whether Whisper transcribed it as the expected Thai word (0–100) */
  transcriptionScore: number;
  /** Weighted composite score (0–100) */
  overallScore: number;
}

export type ScoreLabel = 'perfect' | 'great' | 'good' | 'needs_work' | 'try_again';

// ─── Claude feedback ──────────────────────────────────────────────────────────

export interface PronunciationFeedback {
  scoreLabel: ScoreLabel;
  primaryIssue: string | null;       // null when score is perfect/great
  specificAdvice: string;
  encouragement: string;
  toneHint: string | null;           // only when tone was wrong
  listenAgainCue: string | null;     // phoneme hint when phonemeScore < 60
}

// ─── Main result ─────────────────────────────────────────────────────────────

export interface PronunciationResult {
  cardId: string;
  thai: string;
  romanization: string;
  expectedTone: ThaiTone;
  transcription: TranscriptionResult;
  toneAnalysis: ToneAnalysisResult;
  scores: PronunciationScores;
  feedback: PronunciationFeedback;
  processingMs: number;
}

// ─── Engine config ────────────────────────────────────────────────────────────

export interface PronunciationEngineConfig {
  /** Skip Claude feedback call (used in offline/test mode) */
  offlineMode?: boolean;
  /** Tone score weight in composite (default 0.4) */
  toneWeight?: number;
  /** Phoneme score weight in composite (default 0.35) */
  phonemeWeight?: number;
  /** Transcription score weight in composite (default 0.25) */
  transcriptionWeight?: number;
}
