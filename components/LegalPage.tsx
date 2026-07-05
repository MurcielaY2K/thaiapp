import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';

export type LegalSection = {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
};

type Props = {
  title: string;
  updated: string;
  sections: LegalSection[];
};

export default function LegalPage({ title, updated, sections }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.updated}>Last updated: {updated}</Text>
        {sections.map((s, i) => (
          <View key={i} style={styles.section}>
            {s.heading ? <Text style={styles.heading}>{s.heading}</Text> : null}
            {s.paragraphs.map((p, j) => (
              <Text key={j} style={styles.para}>{p}</Text>
            ))}
            {s.bullets?.map((b, j) => (
              <View key={j} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={styles.contact}>Questions? Contact us at coficollective@gmail.com</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  topBar: { paddingHorizontal: 16, paddingTop: 12 },
  backBtn: {
    alignSelf: 'flex-start', backgroundColor: Colors.bgInset, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.borderStrong,
  },
  backText: { color: Colors.textDim, fontSize: 12, fontFamily: Fonts.hud },
  content: { padding: 24, paddingBottom: 60, maxWidth: 720, width: '100%', alignSelf: 'center' },
  title: {
    color: Colors.text, fontSize: 24,
    fontFamily: Fonts.display, fontWeight: '700', marginBottom: 4,
  },
  updated: { color: Colors.textDim, fontSize: 11, fontFamily: Fonts.mono, marginBottom: 24 },
  section: { marginBottom: 20 },
  heading: {
    color: Colors.lavender, fontSize: 15,
    fontFamily: Fonts.body, fontWeight: '700', marginBottom: 8,
  },
  para: { color: Colors.text, fontSize: 14, fontFamily: Fonts.body, lineHeight: 22, marginBottom: 8 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 6, paddingLeft: 4 },
  bulletDot: { color: Colors.lavender, fontSize: 14, lineHeight: 22 },
  bulletText: { flex: 1, color: Colors.text, fontSize: 14, fontFamily: Fonts.body, lineHeight: 22 },
  contact: { color: Colors.textDim, fontSize: 13, fontFamily: Fonts.body, marginTop: 12 },
});
