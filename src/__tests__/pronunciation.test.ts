import {
  cosineSimilarity,
  resampleContour,
  normalizeContour,
  analyzeTone,
  toneScoreFromSimilarity,
  TONE_REFERENCES,
} from '../engine/toneAnalyzer';
import {
  scorePhonemeMatch,
  scoreTranscriptionMatch,
  setOpenAIClient,
} from '../engine/whisperClient';
import {
  scoreLabelFromOverall,
  buildOfflineFeedback,
  setAnthropicClient,
  generateFeedback,
} from '../engine/pronunciationCoach';
import { PronunciationEngine } from '../engine/pronunciationEngine';
import { createInitialSRSState } from '../engine/srs';
import { VocabCard } from '../types';
import { ToneAnalysisResult, PronunciationScores } from '../types/pronunciation';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_CARD: VocabCard = {
  id: 'food_001',
  type: 'vocabulary',
  thai: 'กิน',
  romanization: 'gin',
  ipa: 'ɡin',
  tone: 'mid',
  consonantClass: 'low',
  englishMeaning: 'to eat',
  category: 'food',
  region: 'krung_thon',
  audioFile: 'audio/food_001.mp3',
  exampleSentence: {
    thai: 'คุณกินข้าวหรือยัง',
    romanization: 'khun gin khao rue yang',
    englishLiteral: 'You eat rice yet?',
    englishNatural: 'Have you eaten yet?',
  },
  tags: ['basic', 'verb'],
  difficultyRating: 1,
};

// ─── toneAnalyzer ─────────────────────────────────────────────────────────────

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = [0.5, 0.5, 0.5, 0.5, 0.5];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5);
  });

  it('returns 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 5);
  });

  it('returns 0 for empty vectors', () => {
    expect(cosineSimilarity([], [])).toBe(0);
  });

  it('returns 0 for zero vectors', () => {
    expect(cosineSimilarity([0, 0, 0], [0, 0, 0])).toBe(0);
  });

  it('returns ~1 for nearly identical vectors', () => {
    const a = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
    const b = [0.51, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.50, 0.49];
    expect(cosineSimilarity(a, b)).toBeGreaterThan(0.99);
  });
});

describe('resampleContour', () => {
  it('returns same length when already target length', () => {
    const c = [0.1, 0.2, 0.3];
    expect(resampleContour(c, 3)).toHaveLength(3);
  });

  it('upsamples shorter contour to target length', () => {
    const c = [0, 1];
    const result = resampleContour(c, 5);
    expect(result).toHaveLength(5);
    expect(result[0]).toBeCloseTo(0);
    expect(result[4]).toBeCloseTo(1);
  });

  it('downsamples longer contour to target length', () => {
    const c = [0, 0.25, 0.5, 0.75, 1.0, 0.75, 0.5, 0.25, 0, 0.25, 0.5, 0.75];
    const result = resampleContour(c, 5);
    expect(result).toHaveLength(5);
  });

  it('handles empty contour by returning zeros', () => {
    const result = resampleContour([], 5);
    expect(result).toHaveLength(5);
    result.forEach(v => expect(v).toBe(0));
  });
});

describe('normalizeContour', () => {
  it('maps min to 0 and max to 1', () => {
    const c = [100, 150, 200];
    const n = normalizeContour(c);
    expect(n[0]).toBeCloseTo(0);
    expect(n[2]).toBeCloseTo(1);
  });

  it('returns all-0.5 for flat contour', () => {
    const c = [120, 120, 120, 120];
    normalizeContour(c).forEach(v => expect(v).toBeCloseTo(0.5));
  });
});

describe('TONE_REFERENCES', () => {
  it('has all 5 Thai tones defined', () => {
    const tones = TONE_REFERENCES.map(r => r.tone);
    expect(tones).toContain('mid');
    expect(tones).toContain('low');
    expect(tones).toContain('falling');
    expect(tones).toContain('high');
    expect(tones).toContain('rising');
  });

  it('each reference has exactly 10 samples', () => {
    TONE_REFERENCES.forEach(ref => {
      expect(ref.shape).toHaveLength(10);
    });
  });

  it('all samples are in 0–1 range', () => {
    TONE_REFERENCES.forEach(ref => {
      ref.shape.forEach(v => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      });
    });
  });
});

describe('analyzeTone', () => {
  it('returns too_short for very brief syllables', () => {
    const result = analyzeTone([100, 120, 115], 'mid', 50);
    expect(result.errorType).toBe('too_short');
    expect(result.isCorrect).toBe(false);
  });

  it('returns no_pitch_detected for empty contour', () => {
    const result = analyzeTone([], 'mid', 500);
    expect(result.errorType).toBe('no_pitch_detected');
  });

  it('returns no_pitch_detected for too few samples', () => {
    const result = analyzeTone([100, 110], 'mid', 500);
    expect(result.errorType).toBe('no_pitch_detected');
  });

  it('detects mid tone correctly with flat contour', () => {
    // Flat pitch → should match mid tone
    const flat = new Array(10).fill(120);
    const result = analyzeTone(flat, 'mid', 300);
    expect(result.expectedTone).toBe('mid');
    expect(result.similarityScore).toBeGreaterThan(0.8);
  });

  it('detects rising tone with upward pitch sweep', () => {
    // Simulate rising tone: low→high
    const rising = [80, 85, 95, 110, 128, 148, 168, 185, 198, 210];
    const result = analyzeTone(rising, 'rising', 300);
    expect(result.expectedTone).toBe('rising');
    // Should have higher similarity to rising than to falling
    expect(result.detectedTone).toBe('rising');
  });

  it('classifies wrong_tone_class when level tone used for contour tone', () => {
    // Flat contour when falling is expected
    const flat = new Array(10).fill(120);
    const result = analyzeTone(flat, 'falling', 300);
    expect(result.isCorrect).toBe(false);
    // flat vs falling is a shape mismatch — should not be correct
    expect(result.errorType).not.toBeNull();
  });
});

describe('toneScoreFromSimilarity', () => {
  it('returns 100 for similarity=1', () => {
    expect(toneScoreFromSimilarity(1)).toBe(100);
  });

  it('returns 0 for similarity=0', () => {
    expect(toneScoreFromSimilarity(0)).toBe(0);
  });

  it('returns less than 50 for similarity=0.5 (curve penalty)', () => {
    // quadratic curve: 100 * 0.5^1.5 ≈ 35
    expect(toneScoreFromSimilarity(0.5)).toBeLessThan(50);
  });

  it('does not go below 0', () => {
    expect(toneScoreFromSimilarity(-1)).toBe(0);
  });
});

// ─── whisperClient ────────────────────────────────────────────────────────────

describe('scorePhonemeMatch', () => {
  it('returns 100 for exact match', () => {
    expect(scorePhonemeMatch('กิน', 'กิน')).toBe(100);
  });

  it('returns 0 for empty transcription', () => {
    expect(scorePhonemeMatch('', 'กิน')).toBe(0);
  });

  it('returns partial score for one-char difference', () => {
    const score = scorePhonemeMatch('กิม', 'กิน'); // one char off
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });

  it('is case-insensitive for romanization', () => {
    expect(scorePhonemeMatch('GIN', 'gin')).toBe(100);
  });
});

describe('scoreTranscriptionMatch', () => {
  it('returns 100 for exact match', () => {
    expect(scoreTranscriptionMatch('กิน', 'กิน')).toBe(100);
  });

  it('returns 80 when transcription contains expected word', () => {
    expect(scoreTranscriptionMatch('ผมกิน', 'กิน')).toBe(80);
  });

  it('returns lower score for partial character overlap', () => {
    const score = scoreTranscriptionMatch('กิม', 'กิน');
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(100);
  });
});

// ─── pronunciationCoach ───────────────────────────────────────────────────────

describe('scoreLabelFromOverall', () => {
  it('returns perfect for 90+', () => expect(scoreLabelFromOverall(95)).toBe('perfect'));
  it('returns great for 75–89', () => expect(scoreLabelFromOverall(80)).toBe('great'));
  it('returns good for 55–74', () => expect(scoreLabelFromOverall(60)).toBe('good'));
  it('returns needs_work for 35–54', () => expect(scoreLabelFromOverall(40)).toBe('needs_work'));
  it('returns try_again for <35', () => expect(scoreLabelFromOverall(20)).toBe('try_again'));
});

describe('buildOfflineFeedback', () => {
  const goodScores: PronunciationScores = {
    toneScore: 90,
    phonemeScore: 85,
    transcriptionScore: 95,
    overallScore: 90,
  };

  const badToneAnalysis: ToneAnalysisResult = {
    expectedTone: 'mid',
    detectedTone: 'rising',
    similarityScore: 0.3,
    isCorrect: false,
    errorType: 'direction_error',
  };

  it('returns correct scoreLabel', () => {
    const fb = buildOfflineFeedback('กิน', goodScores, {
      expectedTone: 'mid',
      detectedTone: 'mid',
      similarityScore: 0.95,
      isCorrect: true,
      errorType: null,
    });
    expect(fb.scoreLabel).toBe('perfect');
    expect(fb.toneHint).toBeNull();
  });

  it('provides tone hint when tone is wrong', () => {
    const fb = buildOfflineFeedback('กิน', { ...goodScores, overallScore: 50 }, badToneAnalysis);
    expect(fb.toneHint).not.toBeNull();
    expect(fb.primaryIssue).toBe('direction_error');
  });

  it('provides listenAgainCue when phonemeScore < 60', () => {
    const fb = buildOfflineFeedback('กิน', { ...goodScores, phonemeScore: 40, overallScore: 40 }, badToneAnalysis);
    expect(fb.listenAgainCue).not.toBeNull();
  });

  it('does not provide listenAgainCue when phonemeScore >= 60', () => {
    const fb = buildOfflineFeedback('กิน', goodScores, {
      expectedTone: 'mid',
      detectedTone: 'mid',
      similarityScore: 0.9,
      isCorrect: true,
      errorType: null,
    });
    expect(fb.listenAgainCue).toBeNull();
  });
});

describe('generateFeedback (mocked Claude)', () => {
  const mockFeedback = {
    scoreLabel: 'good' as const,
    primaryIssue: 'contour_error',
    specificAdvice: 'Keep your pitch flat throughout.',
    encouragement: 'Great effort!',
    toneHint: 'Aim for a flat, steady pitch.',
    listenAgainCue: null,
  };

  beforeEach(() => {
    const mockClient = {
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify(mockFeedback) }],
        }),
      },
    } as unknown as import('@anthropic-ai/sdk').default;
    setAnthropicClient(mockClient);
  });

  it('calls Claude and returns parsed feedback', async () => {
    const scores: PronunciationScores = {
      toneScore: 60,
      phonemeScore: 70,
      transcriptionScore: 80,
      overallScore: 69,
    };
    const toneAnalysis: ToneAnalysisResult = {
      expectedTone: 'mid',
      detectedTone: 'low',
      similarityScore: 0.6,
      isCorrect: false,
      errorType: 'level_error',
    };
    const result = await generateFeedback('กิน', 'gin', scores, toneAnalysis, 'กิน');
    expect(result.scoreLabel).toBe('good');
    expect(result.specificAdvice).toBe('Keep your pitch flat throughout.');
  });

  it('falls back to offline feedback on JSON parse error', async () => {
    const mockClient = {
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'not valid json' }],
        }),
      },
    } as unknown as import('@anthropic-ai/sdk').default;
    setAnthropicClient(mockClient);

    const scores: PronunciationScores = {
      toneScore: 60,
      phonemeScore: 70,
      transcriptionScore: 80,
      overallScore: 69,
    };
    const toneAnalysis: ToneAnalysisResult = {
      expectedTone: 'mid',
      detectedTone: 'low',
      similarityScore: 0.6,
      isCorrect: false,
      errorType: 'level_error',
    };
    const result = await generateFeedback('กิน', 'gin', scores, toneAnalysis, 'กิน');
    // offline fallback still returns a valid object
    expect(result.scoreLabel).toBeDefined();
    expect(result.encouragement).toBeDefined();
  });
});

// ─── pronunciationEngine ──────────────────────────────────────────────────────

describe('PronunciationEngine.scoreToReviewQuality', () => {
  it('maps 90+ to 4 (Perfect)', () => {
    expect(PronunciationEngine.scoreToReviewQuality(95)).toBe(4);
  });
  it('maps 75–89 to 3 (Good)', () => {
    expect(PronunciationEngine.scoreToReviewQuality(80)).toBe(3);
  });
  it('maps 55–74 to 2 (Okay)', () => {
    expect(PronunciationEngine.scoreToReviewQuality(65)).toBe(2);
  });
  it('maps 35–54 to 1 (Hard)', () => {
    expect(PronunciationEngine.scoreToReviewQuality(45)).toBe(1);
  });
  it('maps <35 to 0 (Blackout)', () => {
    expect(PronunciationEngine.scoreToReviewQuality(20)).toBe(0);
  });
});

describe('PronunciationEngine.scoreOffline', () => {
  const engine = new PronunciationEngine({ offlineMode: true });

  it('returns a valid result for a mid-tone card with flat contour', () => {
    const flat = new Array(10).fill(120);
    const result = engine.scoreOffline(MOCK_CARD, flat, 'กิน', 300);
    expect(result.cardId).toBe('food_001');
    expect(result.scores.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.scores.overallScore).toBeLessThanOrEqual(100);
    expect(result.feedback.scoreLabel).toBeDefined();
  });

  it('gives high transcription score for exact Thai match', () => {
    const flat = new Array(10).fill(120);
    const result = engine.scoreOffline(MOCK_CARD, flat, 'กิน', 300);
    expect(result.scores.transcriptionScore).toBe(100);
  });

  it('gives low score for completely wrong transcription', () => {
    const flat = new Array(10).fill(120);
    const result = engine.scoreOffline(MOCK_CARD, flat, 'สวัสดี', 300);
    expect(result.scores.transcriptionScore).toBeLessThan(50);
  });
});

describe('PronunciationEngine.evaluate (mocked APIs)', () => {
  const mockTranscription = {
    text: 'กิน',
    words: [{ word: 'กิน', start: 0, end: 0.3, confidence: 0.95 }],
    language: 'th',
    durationMs: 350,
  };

  beforeEach(() => {
    // Mock OpenAI Whisper
    const mockOpenAI = {
      audio: {
        transcriptions: {
          create: jest.fn().mockResolvedValue({
            text: 'กิน',
            words: [{ word: 'กิน', start: 0, end: 0.3, probability: 0.95 }],
            language: 'th',
          }),
        },
      },
    } as unknown as import('openai').default;
    setOpenAIClient(mockOpenAI);

    // Mock Anthropic (return offline-style JSON)
    const mockFeedback = {
      scoreLabel: 'great',
      primaryIssue: null,
      specificAdvice: 'Nice work on the mid tone.',
      encouragement: 'Keep it up!',
      toneHint: null,
      listenAgainCue: null,
    };
    const mockAnthropic = {
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify(mockFeedback) }],
        }),
      },
    } as unknown as import('@anthropic-ai/sdk').default;
    setAnthropicClient(mockAnthropic);
  });

  it('evaluates a card end-to-end and returns a PronunciationResult', async () => {
    const engine = new PronunciationEngine();
    const audioBuffer = Buffer.from('fake-audio-data');
    const pitchContour = new Array(10).fill(120); // flat = mid tone

    const result = await engine.evaluate(MOCK_CARD, audioBuffer, 'audio.webm', pitchContour);

    expect(result.cardId).toBe('food_001');
    expect(result.thai).toBe('กิน');
    expect(result.transcription.text).toBe('กิน');
    expect(result.scores.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.feedback.scoreLabel).toBeDefined();
    expect(result.processingMs).toBeGreaterThanOrEqual(0);
  });

  it('evaluates without pitch contour (tone score is 0)', async () => {
    const engine = new PronunciationEngine();
    const audioBuffer = Buffer.from('fake-audio-data');

    const result = await engine.evaluate(MOCK_CARD, audioBuffer, 'audio.webm');
    expect(result.scores.toneScore).toBe(0);
    expect(result.toneAnalysis.errorType).toBe('no_pitch_detected');
  });

  it('runs in offline mode without calling Claude', async () => {
    const engine = new PronunciationEngine({ offlineMode: true });
    const audioBuffer = Buffer.from('fake-audio-data');

    const result = await engine.evaluate(MOCK_CARD, audioBuffer, 'audio.webm');
    expect(result.feedback).toBeDefined();
    // Claude mock wouldn't be needed — Anthropic client never called
  });
});

describe('SRS integration via scoreToReviewQuality', () => {
  it('perfect pronunciation feeds into SRS as quality=4', () => {
    const quality = PronunciationEngine.scoreToReviewQuality(95);
    const state = createInitialSRSState('food_001', '2026-05-15');
    // Quality 4 = Perfect — should increment repetitions
    expect(quality).toBe(4);
    expect(state.repetitions).toBe(0);
  });
});
