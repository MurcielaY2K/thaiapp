import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useGame } from '../context/GameContext';
import { colors, spacing, radius, fontSize } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const { createProfile } = useGame();
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter your name to begin the journey.');
      return;
    }
    setIsCreating(true);
    setError('');
    try {
      await createProfile(trimmed);
      navigation.replace('Main');
    } catch {
      setError('Something went wrong. Try again.');
      setIsCreating(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.hero}>
        <Text style={styles.flag}>🇹🇭</Text>
        <Text style={styles.title}>ThaiQuest</Text>
        <Text style={styles.subtitle}>Learn Thai through adventure</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.regionLabel}>เมืองกรุงทอง</Text>
        <Text style={styles.regionName}>The Golden Port</Text>
        <Text style={styles.regionDesc}>
          Your journey begins at the bustling port city. The harbor master eyes
          you suspiciously. Prove yourself, traveler.
        </Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Your name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={t => { setName(t); setError(''); }}
            placeholder="Enter your name..."
            placeholderTextColor={colors.textMuted}
            maxLength={30}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleStart}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <TouchableOpacity
          style={[styles.startButton, (!name.trim() || isCreating) && styles.startButtonDisabled]}
          onPress={handleStart}
          disabled={!name.trim() || isCreating}
          activeOpacity={0.8}
        >
          {isCreating
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.startButtonText}>Begin Journey →</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  flag: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  regionLabel: {
    fontSize: fontSize.xxl,
    color: colors.gold,
    fontWeight: '700',
    textAlign: 'center',
  },
  regionName: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  regionDesc: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
    fontStyle: 'italic',
  },
  inputWrapper: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  error: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: fontSize.md,
  },
});
