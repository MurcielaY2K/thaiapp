import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { useProgressStore } from '../store/progressStore';
import { Colors } from '../constants/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PERKS = [
  '🌍  All 5 learning worlds',
  '❤️  Unlimited hearts',
  '📚  180+ vocabulary words',
  '🏆  All badges & achievements',
];

export default function PremiumModal({ visible, onClose }: Props) {
  const { unlockPremium } = useProgressStore();

  const handleUnlock = () => {
    unlockPremium();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.title}>Go Premium</Text>
          <Text style={styles.sub}>
            Unlock all 5 worlds, infinite hearts, and the full Thai learning experience.
          </Text>

          <View style={styles.perks}>
            {PERKS.map(p => (
              <View key={p} style={styles.perkRow}>
                <Text style={styles.perk}>{p}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleUnlock} activeOpacity={0.85}>
            <Text style={styles.btnText}>Unlock Premium — Free</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.dismissWrap}>
            <Text style={styles.dismiss}>Maybe later</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 12,
  },
  crown: { fontSize: 56 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '800' },
  sub: { color: Colors.textDim, fontSize: 14, textAlign: 'center', lineHeight: 21 },
  perks: { width: '100%', gap: 10, marginVertical: 4 },
  perkRow: {
    backgroundColor: 'rgba(255,159,67,0.08)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,159,67,0.18)',
  },
  perk: { color: Colors.text, fontSize: 14, fontWeight: '500' },
  btn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  dismissWrap: { paddingVertical: 4 },
  dismiss: { color: Colors.textDim, fontSize: 14 },
});
