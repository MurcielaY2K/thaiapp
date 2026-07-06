import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Pressable, Linking, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';
import { STRIPE_PAYMENT_LINK, paymentLinkFor } from '../constants/stripe';
import { supabase } from '../lib/supabase';
import { WORLDS, ALL_LESSONS } from '../data/worlds';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PREMIUM_LESSONS = WORLDS.filter(w => w.isPremium).flatMap(w => w.lessons).length;
const PERKS = [
  { icon: '🌍', text: `All ${WORLDS.length} learning worlds (${ALL_LESSONS.length} lessons)` },
  { icon: '❤️', text: 'Unlimited hearts — never fail a lesson run' },
  { icon: '📚', text: `${PREMIUM_LESSONS} premium lessons across 4 difficulty tiers` },
  { icon: '🏆', text: 'All badges & achievements' },
];

async function openStripe() {
  // The checkout must carry the buyer's Supabase auth uuid so the Stripe
  // webhook can grant the entitlement to this user. Sign in anonymously
  // first if there's no session yet.
  let authId: string | null = null;
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      authId = session?.user.id ?? null;
      if (!authId) {
        const { data } = await supabase.auth.signInAnonymously();
        authId = data?.user?.id ?? null;
      }
    } catch {
      // Fall through — better to let the user pay than to block checkout;
      // an unlinked payment can be linked manually from the dashboard.
    }
  }
  const url = authId ? paymentLinkFor(authId) : STRIPE_PAYMENT_LINK;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(url);
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

          <Text style={styles.legalNote}>
            By subscribing you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => { onClose(); router.push('/terms'); }}>Terms</Text>
            {' '}and{' '}
            <Text style={styles.legalLink} onPress={() => { onClose(); router.push('/refunds'); }}>Refund Policy</Text>.
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
    borderRadius: 8,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: Colors.borderGlow,
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
  badgeText: { color: Colors.gold, fontSize: 11, fontFamily: Fonts.hud, letterSpacing: 1.5 },

  title: {
    color: Colors.text,
    fontSize: 28,
    fontFamily: Fonts.display,
    fontWeight: '700',
    textAlign: 'center',
  },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  price: { color: Colors.gold, fontSize: 44, fontFamily: Fonts.hud },
  priceMeta: { gap: 2 },
  pricePer: { color: Colors.textDim, fontSize: 16, fontWeight: '600' },
  priceSub: { color: Colors.textDim, fontSize: 11 },

  divider: { width: '100%', height: 1, backgroundColor: Colors.border },

  perks: { width: '100%', gap: 10 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perkIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  perkText: { color: Colors.text, fontSize: 14, fontFamily: Fonts.body, flex: 1 },

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
  legalNote: { color: Colors.textDim, fontSize: 10, textAlign: 'center', marginTop: 6, lineHeight: 15 },
  legalLink: { color: Colors.lavender, textDecorationLine: 'underline' },

  dismissWrap: { paddingVertical: 4 },
  dismiss: { color: Colors.textDim, fontSize: 13 },
});
