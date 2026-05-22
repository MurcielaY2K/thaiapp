import React, { useState } from 'react';
import {
  View, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePetStore } from '../../store/petStore';
import { useAchievementStore } from '../../store/achievementStore';
import { PixelText } from '../../components/pixel/PixelText';
import { Colors } from '../../constants/colors';
import { MINI_GAMES } from '../../constants/petData';

// Game components
import { TreatCatch } from '../../components/games/TreatCatch';
import { RetroRace } from '../../components/games/RetroRace';
import { FishingGame } from '../../components/games/FishingGame';
import { DanceBattle } from '../../components/games/DanceBattle';
import { PixelRush } from '../../components/games/PixelRush';

const GAME_COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  treat_catch: TreatCatch,
  retro_race: RetroRace,
  fishing: FishingGame,
  dance: DanceBattle,
  obstacle: PixelRush,
};

export default function GamesScreen() {
  const { pet, earnCoins } = usePetStore();
  const { updateStats, stats } = useAchievementStore();
  const [activeGame, setActiveGame] = useState<string | null>(null);

  if (!pet) return null;
  const petLevel = pet.stats.level;

  const handleGameOver = (gameId: string, result: number) => {
    earnCoins(result);
    updateStats({ totalGamesPlayed: stats.totalGamesPlayed + 1 });

    if (gameId === 'treat_catch') updateStats({ bestTreatScore: Math.max(stats.bestTreatScore, result) });
    if (gameId === 'retro_race') updateStats({ bestRaceScore: Math.max(stats.bestRaceScore, result) });
    if (gameId === 'fishing') updateStats({ bestFishCoins: Math.max(stats.bestFishCoins, result) });
    if (gameId === 'dance') updateStats({ bestDanceScore: Math.max(stats.bestDanceScore, Math.floor(result / 2)) });
    if (gameId === 'obstacle') updateStats({ bestRushScore: Math.max(stats.bestRushScore, result * 2) });
  };

  if (activeGame) {
    const GameComponent = GAME_COMPONENT_MAP[activeGame];
    if (GameComponent) {
      return (
        <SafeAreaView style={styles.safe}>
          <GameComponent
            onGameOver={(score: number) => handleGameOver(activeGame, score)}
            onBack={() => setActiveGame(null)}
          />
        </SafeAreaView>
      );
    }
  }

  // Game menu
  const allGames = [
    ...MINI_GAMES,
    // Extra games with different IDs
    { id: 'dance', name: 'Dance Battle', emoji: '💃', description: 'Hit the arrows in time!', unlockLevel: 6 },
    { id: 'obstacle', name: 'Pixel Rush', emoji: '⚡', description: 'Tap to jump over obstacles!', unlockLevel: 4 },
  ];

  // Deduplicate by id (MINI_GAMES already has dance/obstacle, filter those out)
  const displayGames = [
    { id: 'treat_catch', name: 'Treat Catch', emoji: '🦴', description: 'Slide to catch treats!', unlockLevel: 1 },
    { id: 'retro_race', name: 'Retro Race', emoji: '🏎️', description: 'Dodge the traffic!', unlockLevel: 3 },
    { id: 'fishing', name: 'Pixel Fishing', emoji: '🎣', description: 'Reel in rare fish!', unlockLevel: 5 },
    { id: 'dance', name: 'Dance Battle', emoji: '💃', description: 'Hit the beat!', unlockLevel: 6 },
    { id: 'obstacle', name: 'Pixel Rush', emoji: '⚡', description: 'Auto-runner! Tap to jump.', unlockLevel: 4 },
    { id: 'puzzle', name: 'Paw Puzzle', emoji: '🧩', description: 'Solve pixel puzzles!', unlockLevel: 7 },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <PixelText variant="title" size={18} color={Colors.neon.cyan} glow>🎮  MINI GAMES</PixelText>
          <PixelText size={11} color={Colors.ui.textDim}>
            Win coins & make {pet.name} happy!
          </PixelText>
        </View>

        {/* Best scores strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scoresRow}>
          {[
            { emoji: '🦴', label: 'Treat', value: stats.bestTreatScore },
            { emoji: '🏎️', label: 'Race', value: stats.bestRaceScore },
            { emoji: '🎣', label: 'Fish 🪙', value: stats.bestFishCoins },
            { emoji: '💃', label: 'Dance', value: stats.bestDanceScore },
            { emoji: '⚡', label: 'Rush', value: stats.bestRushScore },
          ].map(s => (
            <View key={s.label} style={styles.scorePill}>
              <PixelText size={14}>{s.emoji}</PixelText>
              <View>
                <PixelText size={9} color={Colors.ui.textDim}>{s.label}</PixelText>
                <PixelText size={12} color={Colors.neon.yellow}>{s.value}</PixelText>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.gameList}>
          {displayGames.map(game => {
            const locked = petLevel < game.unlockLevel;
            const isAvailable = game.id in GAME_COMPONENT_MAP;
            return (
              <TouchableOpacity
                key={game.id}
                style={[
                  styles.gameCard,
                  locked && styles.gameCardLocked,
                  !isAvailable && !locked && styles.gameCardComingSoon,
                ]}
                onPress={() => {
                  if (locked || !isAvailable) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    return;
                  }
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setActiveGame(game.id);
                }}
              >
                <PixelText size={36}>{game.emoji}</PixelText>
                <View style={styles.gameInfo}>
                  <PixelText size={14} color={locked ? Colors.ui.textDim : Colors.ui.textBright}>
                    {game.name}
                  </PixelText>
                  <PixelText size={11} color={Colors.ui.textDim}>{game.description}</PixelText>
                  {locked && (
                    <PixelText size={10} color={Colors.ui.warning}>
                      🔒  Unlock at level {game.unlockLevel}
                    </PixelText>
                  )}
                  {!isAvailable && !locked && (
                    <PixelText size={10} color={Colors.ui.textDim}>🚧  Coming soon</PixelText>
                  )}
                </View>
                {isAvailable && !locked && (
                  <PixelText size={20} color={Colors.neon.cyan}>▶</PixelText>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.deep },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.ui.border,
    gap: 4,
  },
  scoresRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
  },
  gameList: {
    padding: 16,
    gap: 12,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    padding: 14,
    gap: 14,
    shadowColor: Colors.neon.cyan,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  gameCardLocked: {
    opacity: 0.4,
    borderColor: Colors.bg.mid,
    shadowOpacity: 0,
  },
  gameCardComingSoon: {
    opacity: 0.6,
    borderStyle: 'dashed',
  },
  gameInfo: {
    flex: 1,
    gap: 3,
  },
});
