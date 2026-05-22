import React from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { usePetStore } from '../../store/petStore';
import { PixelText } from '../../components/pixel/PixelText';
import { RetroButton } from '../../components/ui/RetroButton';
import { Colors } from '../../constants/colors';

export default function SettingsModal() {
  const { pet, resetPet, coins, gems } = usePetStore();

  const handleReset = () => {
    Alert.alert(
      '⚠️ Reset Pet?',
      'This will permanently delete your pet and all progress. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            resetPet();
            router.replace('/modals/onboarding');
          },
        },
      ]
    );
  };

  if (!pet) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <PixelText size={20} color={Colors.ui.textDim}>✕</PixelText>
        </TouchableOpacity>
        <PixelText variant="title" size={16} color={Colors.ui.textBright}>⚙️  SETTINGS</PixelText>
        <View style={{ width: 20 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <PixelText variant="label">Your Pet</PixelText>
          <PixelText size={14} color={Colors.ui.textBright}>{pet.name}</PixelText>
          <PixelText size={11} color={Colors.ui.textDim}>
            Level {pet.stats.level}  •  {pet.evolutionStage}  •  {pet.personality}
          </PixelText>
          <PixelText size={11} color={Colors.ui.textDim}>
            Total care actions: {pet.totalCareActions}
          </PixelText>
        </View>

        <View style={styles.card}>
          <PixelText variant="label">Currency</PixelText>
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <PixelText size={14} color={Colors.neon.yellow}>🪙  {coins} coins</PixelText>
            <PixelText size={14} color={Colors.neon.cyan}>💎  {gems} gems</PixelText>
          </View>
        </View>

        <View style={styles.card}>
          <PixelText variant="label">About</PixelText>
          <PixelText size={12} color={Colors.ui.textDim}>
            Petagotchi v1.0{'\n'}
            Transform your real pet into an adorable pixel creature!{'\n'}
            Made with ❤️ and lots of pixels.
          </PixelText>
        </View>

        <RetroButton
          label="Reset Pet"
          onPress={handleReset}
          color={Colors.ui.danger}
          emoji="🗑️"
          style={{ marginTop: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.deep },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.ui.border,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 16,
    gap: 8,
  },
});
