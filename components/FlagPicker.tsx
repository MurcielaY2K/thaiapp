import React from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Pressable,
} from 'react-native';
import { Colors } from '../constants/colors';

const FLAGS = [
  '🌍', '🇹🇭', '🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳',
  '🇦🇺', '🇧🇷', '🇷🇺', '🇮🇹', '🇪🇸', '🇨🇦', '🇲🇽', '🇸🇬', '🇳🇱', '🇸🇪',
  '🇳🇴', '🇩🇰', '🇵🇱', '🇵🇹', '🇦🇷', '🇿🇦', '🇪🇬', '🇳🇬', '🇮🇩', '🇻🇳',
  '🇵🇭', '🇲🇾', '🇺🇦', '🇨🇭', '🇧🇪', '🇦🇹', '🇨🇿', '🇭🇺', '🇬🇷', '🇮🇱',
];

interface Props {
  visible: boolean;
  selected: string;
  onSelect: (flag: string) => void;
  onClose: () => void;
}

export default function FlagPicker({ visible, selected, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Choose Flag</Text>
          <ScrollView contentContainerStyle={styles.grid}>
            {FLAGS.map(flag => (
              <TouchableOpacity
                key={flag}
                style={[styles.cell, flag === selected && styles.cellActive]}
                onPress={() => { onSelect(flag); onClose(); }}
                activeOpacity={0.75}
              >
                <Text style={styles.flag}>{flag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingBottom: 40, paddingHorizontal: 20,
    maxHeight: '55%',
    borderTopWidth: 1, borderColor: Colors.border,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16,
  },
  title: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  cell: {
    width: 52, height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bg, borderWidth: 2, borderColor: Colors.border,
  },
  cellActive: { borderColor: '#ff9f43', backgroundColor: 'rgba(255,159,67,0.12)' },
  flag: { fontSize: 28 },
});
