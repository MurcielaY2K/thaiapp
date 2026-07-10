import React from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Pressable,
} from 'react-native';
import { Colors } from '../constants/colors';
import { FLAG_ORDER, EMOJI_TO_CODE } from '../data/flags';
import PixelFlag from './PixelFlag';

interface Props {
  visible: boolean;
  selected: string;
  onSelect: (flag: string) => void;
  onClose: () => void;
}

export default function FlagPicker({ visible, selected, onSelect, onClose }: Props) {
  // Normalise legacy emoji selections to codes so the right cell highlights.
  const selCode = EMOJI_TO_CODE[selected] ?? selected;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Choose Flag</Text>
          <ScrollView contentContainerStyle={styles.grid}>
            {FLAG_ORDER.map(code => (
              <TouchableOpacity
                key={code}
                style={[styles.cell, code === selCode && styles.cellActive]}
                onPress={() => { onSelect(code); onClose(); }}
                activeOpacity={0.75}
              >
                <PixelFlag value={code} size={40} />
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
    maxHeight: '60%',
    borderTopWidth: 1, borderColor: Colors.border,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: 16,
  },
  title: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  cell: {
    width: 60, height: 56, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bg, borderWidth: 2, borderColor: Colors.border,
  },
  cellActive: { borderColor: Colors.lavender, backgroundColor: 'rgba(196,181,244,0.12)' },
});
