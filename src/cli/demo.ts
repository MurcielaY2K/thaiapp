/**
 * ThaiQuest CLI demo — no UI required.
 *
 * Simulates a full player journey:
 *   1. Create a new profile
 *   2. Auto-start the first two story quests
 *   3. Run three simulated sessions (mixed performance)
 *   4. Print a dashboard after each session
 *   5. Show final stats and quest progress
 *
 * Run with:
 *   npx ts-node src/cli/demo.ts
 */

import { GameFacade } from '../GameFacade';
import { MemoryStorage } from '../storage/memoryStorage';
import { ReviewQuality } from '../types';
import {
  getAvailableQuestIds,
  startQuest,
  createQuestProgress,
  evaluateQuestProgress,
  applyQuestRewards,
  getQuestProgressPercent,
  QuestProgress,
} from '../engine/questEngine';
import { getQuestsByRegion, getQuestById } from '../data/quests';
import { VOCABULARY } from '../data/vocabulary';

const TODAY = new Date().toISOString().split('T')[0];
const LINE = '─'.repeat(60);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) { process.stdout.write(msg + '\n'); }
function pad(s: string, n: number) { return s.slice(0, n).padEnd(n); }
function bar(percent: number, width = 20): string {
  const filled = Math.round((percent / 100) * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

/** Deterministic "player skill" — returns a quality that improves over time */
function simulateQuality(sessionNum: number, cardIndex: number): ReviewQuality {
  // Earlier sessions have more blackouts; later sessions are better
  const seed = (sessionNum * 17 + cardIndex * 7) % 100;
  if (sessionNum === 1) {
    if (seed < 20) return 0; // 20% blackout
    if (seed < 40) return 1; // 20% hard
    if (seed < 65) return 2; // 25% okay
    if (seed < 85) return 3; // 20% good
    return 4;                // 15% perfect
  }
  if (sessionNum === 2) {
    if (seed < 8) return 0;
    if (seed < 25) return 1;
    if (seed < 50) return 2;
    if (seed < 78) return 3;
    return 4;
  }
  // Session 3 — near-perfect
  if (seed < 3) return 0;
  if (seed < 12) return 1;
  if (seed < 30) return 2;
  if (seed < 65) return 3;
  return 4;
}

function timeTakenMs(quality: ReviewQuality): number {
  const base = [9000, 7000, 5000, 3500, 2000];
  return base[quality] + Math.floor(Math.random() * 500);
}

// ─── Quest progress tracker (standalone, outside GameFacade for now) ──────────

type ProgressMap = Record<string, QuestProgress>;

function autoActivateQuests(profileWrapper: { questIds: string[] }, progressMap: ProgressMap) {
  const regionQuests = getQuestsByRegion('krung_thon');
  const available = getAvailableQuestIds(
    regionQuests,
    profileWrapper.questIds,
    Object.keys(progressMap),
  );
  for (const qid of available.slice(0, 3)) { // auto-accept up to 3 at a time
    if (!progressMap[qid]) {
      progressMap[qid] = createQuestProgress(qid);
      log(`  ✦ Quest accepted: "${getQuestById(qid)?.title}"`);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const storage = new MemoryStorage();
  const game = new GameFacade(storage, { today: TODAY });

  log('');
  log('╔══════════════════════════════════════════════════════════╗');
  log('║                  ThaiQuest — Core Demo                   ║');
  log('╚══════════════════════════════════════════════════════════╝');
  log('');

  // ── Init ──────────────────────────────────────────────────────────────────
  const profile = await game.init('Niran Kasem', 'avatar_2');
  log(`  Player   : ${profile.name}`);
  log(`  Region   : เมืองกรุงทอง (The Golden Port)`);
  log(`  Companion: phi_lok (spirit guide)`);
  log(`  Date     : ${TODAY}`);
  log('');

  const completedQuestIds: string[] = [];
  const progressMap: ProgressMap = {};

  // ── Run 3 sessions ────────────────────────────────────────────────────────
  for (let sessionNum = 1; sessionNum <= 3; sessionNum++) {
    log(LINE);
    log(`  SESSION ${sessionNum}`);
    log(LINE);

    // Activate available quests before session
    autoActivateQuests({ questIds: completedQuestIds }, progressMap);
    log('');

    const session = game.startSession();
    const cardCount = session.cards.length;
    log(`  Cards queued : ${cardCount}`);
    log('');

    const speakingScores: number[] = [];
    const reviewedCategories: string[] = [];

    for (let i = 0; i < cardCount; i++) {
      const quality = simulateQuality(sessionNum, i);
      const ms = timeTakenMs(quality);
      const result = game.answerCard(quality as ReviewQuality, ms);
      const card = session.cards[i].card;

      reviewedCategories.push(card.category);
      if (card.type === 'speaking') {
        speakingScores.push(quality >= 3 ? 60 + quality * 10 : quality * 20);
      }

      const qualityLabel = ['✗ Blackout', '△ Hard', '◇ Okay', '● Good', '★ Perfect'][quality];
      const timeStr = `${(ms / 1000).toFixed(1)}s`;
      log(`  ${String(i + 1).padStart(2)}/${cardCount}  ${pad(card.thai, 10)} ${pad(card.englishMeaning, 18)} ${qualityLabel.padEnd(12)} ${timeStr}`);
    }

    const finalResult = await game.endSession();
    if (!finalResult) continue;

    const { summary, levelUpEvent, streakUpdate } = finalResult;
    log('');
    log('  ── Results ─────────────────────────────────────────────');
    log(`  XP earned  : +${summary.xpEarned}  (total: ${game.profile.totalXP})`);
    log(`  Gold earned: +${summary.goldEarned}  (total: ${game.profile.gold})`);
    log(`  Accuracy   : ${Math.round(summary.accuracy * 100)}%`);
    log(`  Avg time   : ${summary.averageTimeSec.toFixed(1)}s/card`);
    log(`  New words  : ${summary.newWordsLearned}`);
    if (summary.perfectSession) log('  ⭐ Perfect session bonus!');
    if (levelUpEvent.didLevelUp) log(`  🎉 LEVEL UP! → Level ${levelUpEvent.newLevel}`);
    if (streakUpdate.streakMilestone) log(`  🔥 Streak milestone: ${streakUpdate.streakMilestone} days!`);
    if (levelUpEvent.newRegionsUnlocked.length > 0) {
      log(`  🗺  New region unlocked: ${levelUpEvent.newRegionsUnlocked.join(', ')}`);
    }

    // ── Quest progress ──────────────────────────────────────────────────────
    const questInput = {
      sessionSummary: summary,
      reviewedCardCategories: reviewedCategories as any[],
      speakingScores,
      totalWordsLearned: game.profile.totalWordsLearned,
      totalCardsReviewed: game.profile.totalCardsReviewed,
    };

    const completedThisSession: string[] = [];
    for (const [qid, prog] of Object.entries(progressMap)) {
      if (prog.isComplete) continue;
      const quest = getQuestById(qid);
      if (!quest) continue;
      const updated = evaluateQuestProgress(quest, prog, questInput);
      progressMap[qid] = updated;
      if (updated.isComplete) {
        const reward = applyQuestRewards(game.profile, quest);
        completedThisSession.push(qid);
        completedQuestIds.push(qid);
        log(`  ✅ Quest complete: "${quest.title}" (+${reward.xpGained} XP, +${reward.goldGained} gold)`);
        if (reward.companionUnlocked) log(`     Companion unlocked: ${reward.companionUnlocked}`);
      }
    }

    log('');
  }

  // ── Final dashboard ───────────────────────────────────────────────────────
  log(LINE);
  log('  FINAL DASHBOARD');
  log(LINE);

  const stats = game.getDashboardStats();
  const p = game.profile;

  log(`  ${pad('Name', 18)}: ${p.name}`);
  log(`  ${pad('Level', 18)}: ${p.currentLevel} (${p.totalXP} XP total)`);
  log(`  ${pad('Streak', 18)}: ${p.currentStreak} day${p.currentStreak !== 1 ? 's' : ''}`);
  log(`  ${pad('Gold', 18)}: ${p.gold}`);
  log(`  ${pad('Total reviews', 18)}: ${p.totalCardsReviewed}`);
  log(`  ${pad('Words learned', 18)}: ${p.totalWordsLearned}`);
  log(`  ${pad('Mastered cards', 18)}: ${stats.masteredCards}`);
  log(`  ${pad('Due tomorrow', 18)}: ${stats.dueToday} card${stats.dueToday !== 1 ? 's' : ''}`);
  log('');

  // ── Quest board ───────────────────────────────────────────────────────────
  log('  QUEST BOARD — krung_thon');
  log('');
  const regionQuests = getQuestsByRegion('krung_thon').filter(q => q.type !== 'daily');
  for (const quest of regionQuests) {
    const done = completedQuestIds.includes(quest.id);
    const active = !!progressMap[quest.id] && !done;
    const prog = progressMap[quest.id];
    const pct = prog ? getQuestProgressPercent(prog) : 0;

    const status = done ? '✅' : active ? '🔵' : '⬜';
    const progressStr = active ? ` ${bar(pct, 15)} ${pct}%` : '';
    log(`  ${status} ${pad(quest.title, 32)}${progressStr}`);
  }

  log('');
  log('  Sessions recorded: ' + game.getSessionHistory().length);
  log('');
  log('─'.repeat(60));
  log('  Demo complete. The full engine is ready for a UI layer.');
  log('─'.repeat(60));
  log('');
}

main().catch(err => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
