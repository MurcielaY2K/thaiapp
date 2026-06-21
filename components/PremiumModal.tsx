import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Pressable, Linking, Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { STRIPE_PAYMENT_LINK } from '../constants/stripe';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PERKS = [
  { icon: '🌍', text: 'All 5 learning worlds' },
  { icon: '❤️', text: 'Unlimited hearts — never stop learning' },
  { icon: '📚', text: '180+ vocabulary words unlocked' },
  { icon: '🏆', text: 'All badges & achievements' },
];

function openStripe() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(STRIPE_PAYMENT_LINK, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(STRIPE_PAYMENT_LINK);
  }
}

export default function PremiumModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>👑  PREMIUM</Text>
          </View>

          <Text style={styles.title}>Unlock Thai{'\n'}Premium</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>฿199</Text>
            <View style={styles.priceMeta}>
              <Text style={styles.pricePer}>/ month</Text>
              <Text style={styles.priceSub}>Cancel anytime</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.perks}>
            {PERKS.map(p => (
              <View key={p.icon} style={styles.perkRow}>
                <Text style={styles.perkIcon}>{p.icon}</Text>
                <Text style={styles.perkText}>{p.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.stripeBtn} onPress={openStripe} activeOpacity={0.88}>
            <Text style={styles.stripeLogo}>stripe</Text>
            <Text style={styles.stripeBtnText}>Subscribe with Stripe</Text>
            <Text style={styles.stripeArrow}>›</Text>
          </TouchableOpacity>

          <Text style={styles.secureNote}>
            🔒 Secure payment · Powered by Stripe
          </Text>

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
    backgroundColor: 'rgba(0,0,0,0.78)',
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
    gap: 14,
  },

  badge: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  badgeText: { color: '#ffd700', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  title: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
  },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { color: Colors.accent, fontSize: 44, fontWeight: '800' },
  priceMeta: { gap: 2 },
  pricePer: { color: Colors.textDim, fontSize: 16, fontWeight: '600' },
  priceSub: { color: Colors.textDim, fontSize: 11 },

  divider: { width: '100%', height: 1, backgroundColor: Colors.border },

  perks: { width: '100%', gap: 10 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perkIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  perkText: { color: Colors.text, fontSize: 14, flex: 1 },

  stripeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#635bff',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 22,
    width: '100%',
    marginTop: 4,
  },
  stripeLogo: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  stripeBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', flex: 1, textAlign: 'center' },
  stripeArrow: { color: '#fff', fontSize: 22, opacity: 0.8 },

  secureNote: { color: Colors.textDim, fontSize: 11, textAlign: 'center' },

  dismissWrap: { paddingVertical: 4 },
  dismiss: { color: Colors.textDim, fontSize: 13 },
});
