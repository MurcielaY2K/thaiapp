import Anthropic from '@anthropic-ai/sdk';
import { ThaiTone } from '../types';
import {
  PronunciationScores,
  ToneAnalysisResult,
  PronunciationFeedback,
  ScoreLabel,
} from '../types/pronunciation';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic();
  }
  return _client;
}

/** Exposed for testing — swap in a mock client */
export function setAnthropicClient(client: Anthropic): void {
  _client = client;
}

// ─── System prompt (cached) ───────────────────────────────────────────────────
// This block is sent with cache_control so it's stored server-side.
// All per-word context goes in the user message only.

const SYSTEM_PROMPT = `You are ThaiQuest's pronunciation coach — an expert in Thai phonology, tone linguistics, and second-language acquisition. You give concise, specific, encouraging feedback to English-speaking learners of Thai.

Thai has five tones that carry lexical meaning:
- Mid (สามัญ): flat, medium pitch
- Low (เอก): flat, low pitch, slightly dipped
- Falling (โท): high start, falls to low — like a firm statement
- High (ตรี): starts mid-high, rises slightly
- Rising (จัตวา): starts low, rises — like a question in English

Learner errors tend to fall into these categories:
- wrong_tone_class: using a level tone when a contour tone is needed (or vice versa)
- direction_error: producing a rising tone instead of falling or vice versa
- level_error: confusing mid/low/high level tones
- contour_error: the shape is roughly right but pitch is at the wrong height
- too_short: syllable was too brief to analyze
- no_pitch_detected: audio was silent or too quiet

Your feedback must:
1. Be 1–3 sentences max per field
2. Use simple English — no linguistic jargon unless you immediately define it
3. Be concrete (e.g., "start your voice at your lowest natural pitch" not "lower your tone")
4. Be warm and encouraging — mistakes are normal, progress is real
5. Reference the specific Thai word the learner attempted

Respond ONLY with a JSON object matching this schema (no markdown, no prose outside JSON):
{
  "scoreLabel": "perfect" | "great" | "good" | "needs_work" | "try_again",
  "primaryIssue": string | null,
  "specificAdvice": string,
  "encouragement": string,
  "toneHint": string | null,
  "listenAgainCue": string | null
}`;

// ─── Score → label mapping ────────────────────────────────────────────────────

export function scoreLabelFromOverall(overallScore: number): ScoreLabel {
  if (overallScore >= 90) return 'perfect';
  if (overallScore >= 75) return 'great';
  if (overallScore >= 55) return 'good';
  if (overallScore >= 35) return 'needs_work';
  return 'try_again';
}

// ─── Offline fallback (no API call) ──────────────────────────────────────────

export function buildOfflineFeedback(
  thai: string,
  scores: PronunciationScores,
  toneAnalysis: ToneAnalysisResult,
): PronunciationFeedback {
  const scoreLabel = scoreLabelFromOverall(scores.overallScore);

  const toneHints: Record<ThaiTone, string> = {
    mid:     'Keep your pitch flat and steady at your natural speaking pitch.',
    low:     'Drop your voice to the lowest comfortable pitch and hold it flat.',
    falling: 'Start high — almost like you\'re surprised — then let your voice fall.',
    high:    'Push your voice up slightly above your natural pitch and hold it there.',
    rising:  'Start low and let your voice glide upward, like you\'re asking a question.',
  };

  const toneHint =
    !toneAnalysis.isCorrect && toneAnalysis.expectedTone
      ? toneHints[toneAnalysis.expectedTone]
      : null;

  const encouragementMap: Record<ScoreLabel, string> = {
    perfect:    `Perfect! Your pronunciation of ${thai} is spot on.`,
    great:      `Great job with ${thai}! You're very close to native-level.`,
    good:       `Good effort on ${thai}! Keep practicing and it'll click soon.`,
    needs_work: `${thai} is tricky — every repetition brings you closer.`,
    try_again:  `Thai tones take time. Try ${thai} again — you've got this.`,
  };

  return {
    scoreLabel,
    primaryIssue: toneAnalysis.errorType,
    specificAdvice: toneHint ?? 'Focus on matching the pitch shape of the example audio.',
    encouragement: encouragementMap[scoreLabel],
    toneHint,
    listenAgainCue:
      scores.phonemeScore < 60
        ? `Listen to the example audio again, paying attention to how your mouth position changes.`
        : null,
  };
}

// ─── Claude API feedback ──────────────────────────────────────────────────────

/**
 * Call Claude to generate personalized pronunciation feedback.
 * The system prompt is cached server-side; only the per-word user message
 * is sent fresh each call.
 */
export async function generateFeedback(
  thai: string,
  romanization: string,
  scores: PronunciationScores,
  toneAnalysis: ToneAnalysisResult,
  transcribedText: string,
): Promise<PronunciationFeedback> {
  const client = getClient();
  const scoreLabel = scoreLabelFromOverall(scores.overallScore);

  const userMessage = buildUserMessage(
    thai,
    romanization,
    scores,
    toneAnalysis,
    transcribedText,
    scoreLabel,
  );

  const response = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 512,
    thinking: { type: 'adaptive' },
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  });

  const textBlock = response.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return buildOfflineFeedback(thai, scores, toneAnalysis);
  }

  try {
    const parsed = JSON.parse(textBlock.text) as PronunciationFeedback;
    return {
      scoreLabel: parsed.scoreLabel ?? scoreLabel,
      primaryIssue: parsed.primaryIssue ?? toneAnalysis.errorType,
      specificAdvice: parsed.specificAdvice ?? '',
      encouragement: parsed.encouragement ?? '',
      toneHint: parsed.toneHint ?? null,
      listenAgainCue: parsed.listenAgainCue ?? null,
    };
  } catch {
    return buildOfflineFeedback(thai, scores, toneAnalysis);
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildUserMessage(
  thai: string,
  romanization: string,
  scores: PronunciationScores,
  toneAnalysis: ToneAnalysisResult,
  transcribedText: string,
  scoreLabel: ScoreLabel,
): string {
  const toneStatus = toneAnalysis.isCorrect
    ? `correct ${toneAnalysis.expectedTone} tone`
    : `expected ${toneAnalysis.expectedTone}, produced ${toneAnalysis.detectedTone ?? 'undetected'} (${toneAnalysis.errorType})`;

  return `The learner attempted to say the Thai word "${thai}" (romanization: ${romanization}).

Scores:
- Overall: ${scores.overallScore}/100 (${scoreLabel})
- Tone: ${scores.toneScore}/100 — ${toneStatus}
- Phoneme: ${scores.phonemeScore}/100
- Transcription match: ${scores.transcriptionScore}/100

Whisper heard: "${transcribedText}"

Provide feedback JSON.`;
}
