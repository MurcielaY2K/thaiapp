import React from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Pressable,
} from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  visible: boolean;
  avatars: string[];
  selected: string;
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function AvatarPicker({ visible, avatars, selected, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.title}>Choose Avatar</Text>
          <ScrollView contentContainerStyle={styles.grid}>
            {avatars.map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={[styles.cell, emoji === selected && styles.cellActive]}
                onPress={() => { onSelect(emoji); onClose(); }}
                activeOpacity={0.75}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '60%',
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: 16,
  },
  title: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  cell: {
    width: 56, height: 56, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cellActive: {
    borderColor: '#ff9f43',
    backgroundColor: 'rgba(255,159,67,0.12)',
  },
  emoji: { fontSize: 32 },
});
