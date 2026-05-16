import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize } from '../theme/colors';

interface Props {
  label: string;
  value: string | number;
  accent?: string;
  icon?: string;
}

export function StatCard({ label, value, accent = colors.primary, icon }: Props) {
  return (
    <View style={[styles.card, { borderTopColor: accent }]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 2,
  },
  icon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
});
