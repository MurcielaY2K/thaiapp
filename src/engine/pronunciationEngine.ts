import { VocabCard } from '../types';
import {
  PitchContour,
  PronunciationEngineConfig,
  PronunciationResult,
} from '../types/pronunciation';
import { analyzeTone, toneScoreFromSimilarity } from './toneAnalyzer';
import { transcribeAudio, scorePhonemeMatch, scoreTranscriptionMatch } from './whisperClient';
import { generateFeedback, buildOfflineFeedback, scoreLabelFromOverall } from './pronunciationCoach';

const DEFAULT_CONFIG: Required<PronunciationEngineConfig> = {
  offlineMode: false,
  toneWeight: 0.40,
  phonemeWeight: 0.35,
  transcriptionWeight: 0.25,
};

export class PronunciationEngine {
  private config: Required<PronunciationEngineConfig>;

  constructor(config: PronunciationEngineConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Evaluate a learner's pronunciation attempt.
   *
   * @param card         The VocabCard the learner attempted
   * @param audioBuffer  Raw audio bytes from the learner's microphone
   * @param audioFilename Filename hint for Whisper format detection (e.g. "audio.webm")
   * @param pitchContour Optional pitch samples extracted client-side (Hz values).
   *                     When omitted, tone scoring is skipped (toneScore = 0).
   */
  async evaluate(
    card: VocabCard,
    audioBuffer: Buffer,
    audioFilename: string,
    pitchContour?: PitchContour,
  ): Promise<PronunciationResult> {
    const start = Date.now();

    // Step 1: Transcribe with Whisper
    const transcription = await transcribeAudio(audioBuffer, audioFilename, card.thai);

    // Step 2: Tone analysis (if pitch data available)
    const syllableDurationMs = transcription.words.length > 0
      ? (transcription.words[0].end - transcription.words[0].start) * 1000
      : transcription.durationMs;

    const toneAnalysis = pitchContour && pitchContour.length > 0
      ? analyzeTone(pitchContour, card.tone, syllableDurationMs)
      : {
          expectedTone: card.tone,
          detectedTone: null,
          similarityScore: 0,
          isCorrect: false,
          errorType: 'no_pitch_detected' as const,
        };

    // Step 3: Compute scores
    const toneScore = pitchContour && pitchContour.length > 0
      ? toneScoreFromSimilarity(toneAnalysis.similarityScore)
      : 0;

    const phonemeScore = scorePhonemeMatch(transcription.text, card.thai);
    const transcriptionScore = scoreTranscriptionMatch(transcription.text, card.thai);

    const { toneWeight, phonemeWeight, transcriptionWeight } = this.config;
    const overallScore = Math.round(
      toneScore * toneWeight +
      phonemeScore * phonemeWeight +
      transcriptionScore * transcriptionWeight,
    );

    const scores = { toneScore, phonemeScore, transcriptionScore, overallScore };

    // Step 4: Generate feedback
    const feedback = this.config.offlineMode
      ? buildOfflineFeedback(card.thai, scores, toneAnalysis)
      : await generateFeedback(
          card.thai,
          card.romanization,
          scores,
          toneAnalysis,
          transcription.text,
        );

    return {
      cardId: card.id,
      thai: card.thai,
      romanization: card.romanization,
      expectedTone: card.tone,
      transcription,
      toneAnalysis,
      scores,
      feedback,
      processingMs: Date.now() - start,
    };
  }

  /**
   * Quick offline score — no API calls, no audio processing.
   * Useful for testing or when the device is offline.
   *
   * @param card        The card attempted
   * @param pitchContour Pitch samples from the client
   * @param transcribedText Text already transcribed client-side
   */
  scoreOffline(
    card: VocabCard,
    pitchContour: PitchContour,
    transcribedText: string,
    durationMs: number,
  ): Omit<PronunciationResult, 'transcription' | 'processingMs'> {
    const toneAnalysis = analyzeTone(pitchContour, card.tone, durationMs);
    const toneScore = toneScoreFromSimilarity(toneAnalysis.similarityScore);
    const phonemeScore = scorePhonemeMatch(transcribedText, card.thai);
    const transcriptionScore = scoreTranscriptionMatch(transcribedText, card.thai);

    const { toneWeight, phonemeWeight, transcriptionWeight } = this.config;
    const overallScore = Math.round(
      toneScore * toneWeight +
      phonemeScore * phonemeWeight +
      transcriptionScore * transcriptionWeight,
    );

    const scores = { toneScore, phonemeScore, transcriptionScore, overallScore };
    const feedback = buildOfflineFeedback(card.thai, scores, toneAnalysis);

    return {
      cardId: card.id,
      thai: card.thai,
      romanization: card.romanization,
      expectedTone: card.tone,
      toneAnalysis,
      scores,
      feedback,
    };
  }

  /**
   * Map an overall pronunciation score to a ReviewQuality (0–4)
   * so it integrates with the SRS engine.
   */
  static scoreToReviewQuality(overallScore: number): 0 | 1 | 2 | 3 | 4 {
    const label = scoreLabelFromOverall(overallScore);
    const map: Record<string, 0 | 1 | 2 | 3 | 4> = {
      perfect:    4,
      great:      3,
      good:       2,
      needs_work: 1,
      try_again:  0,
    };
    return map[label];
  }
}
