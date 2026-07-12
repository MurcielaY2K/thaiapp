import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Pressable, Linking, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/typography';
import { PREMIUM_TIERS, availableTiers, paymentLinkFor, STRIPE_CHECKOUT_ENABLED, PremiumTier } from '../constants/stripe';
import { supabase } from '../lib/supabase';
import { WORLDS, ALL_LESSONS } from '../data/worlds';
import { track } from '../lib/analytics';

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

async function openStripe(tier: PremiumTier) {
  // Web only — never open an external payment flow inside a store build.
  if (!STRIPE_CHECKOUT_ENABLED) return;
  track('checkout_click', { tier: tier.id });
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
  const url = paymentLinkFor(tier, authId);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    Linking.openURL(url);
  }
}

export default function PremiumModal({ visible, onClose }: Props) {
  React.useEffect(() => { if (visible) track('paywall_view'); }, [visible]);
  // Tiers without a Stripe link yet are hidden; preselect the highlighted one.
  const tiers = availableTiers();
  const [tierId, setTierId] = React.useState(
    (tiers.find(t => t.highlight) ?? tiers[0])?.id ?? 'monthly',
  );
  const tier = tiers.find(t => t.id === tierId) ?? tiers[0];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>👑  PREMIUM</Text>
          </View>

          <Text style={styles.title}>Unlock Thai{'\n'}Premium</Text>

          {tiers.length > 1 ? (
            <View style={styles.tierRow}>
              {tiers.map(t => {
                const active = t.id === tierId;
                return (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.tier, active && styles.tierActive]}
                    onPress={() => setTierId(t.id)}
                    activeOpacity={0.85}
                  >
                    {t.highlight && <Text style={styles.tierTag}>BEST VALUE</Text>}
                    <Text style={[styles.tierLabel, active && styles.tierLabelActive]}>{t.label}</Text>
                    <Text style={[styles.tierPrice, active && styles.tierPriceActive]}>{t.price}</Text>
                    <Text style={styles.tierPer}>{t.per}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : tier ? (
            <View style={styles.priceRow}>
              <Text style={styles.price}>{tier.price}</Text>
              <View style={styles.priceMeta}>
                <Text style={styles.pricePer}>{tier.per}</Text>
                <Text style={styles.priceSub}>{tier.note ?? ''}</Text>
              </View>
            </View>
          ) : null}
          {tiers.length > 1 && tier?.note ? (
            <Text style={styles.tierNote}>{tier.note}</Text>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.perks}>
            {PERKS.map(p => (
              <View key={p.icon} style={styles.perkRow}>
                <Text style={styles.perkIcon}>{p.icon}</Text>
                <Text style={styles.perkText}>{p.text}</Text>
              </View>
            ))}
          </View>

          {STRIPE_CHECKOUT_ENABLED ? (
            <>
              <TouchableOpacity
                style={styles.stripeBtn}
                onPress={() => tier && openStripe(tier)}
                activeOpacity={0.88}
              >
                <Text style={styles.stripeLogo}>stripe</Text>
                <Text style={styles.stripeBtnText}>
                  {tier?.id === 'lifetime' ? 'Buy once with Stripe' : 'Subscribe with Stripe'}
                </Text>
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
            </>
          ) : (
            // Store builds: no external payment (App Store 3.1.1 / Play Payments).
            // In-app purchase is not wired up yet, so we don't advertise a way to
            // buy or steer users off-app — just say it's coming.
            <>
              <View style={styles.soonBox}>
                <Text style={styles.soonText}>Premium in-app purchase is coming soon.</Text>
              </View>
              <Text style={styles.legalNote}>
                See our{' '}
                <Text style={styles.legalLink} onPress={() => { onClose(); router.push('/terms'); }}>Terms</Text>
                {' '}and{' '}
                <Text style={styles.legalLink} onPress={() => { onClose(); router.push('/privacy'); }}>Privacy Policy</Text>.
              </Text>
            </>
          )}

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

  tierRow: { flexDirection: 'row', gap: 8, width: '100%' },
  tier: {
    flex: 1, alignItems: 'center', gap: 2, paddingVertical: 12, paddingHorizontal: 4,
    borderRadius: 10, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.bgInset,
  },
  tierActive: { borderColor: Colors.gold, backgroundColor: 'rgba(255,215,0,0.10)' },
  tierTag: {
    position: 'absolute', top: -9, backgroundColor: Colors.gold, color: '#17150f',
    fontSize: 8, fontFamily: Fonts.hud, fontWeight: '700', letterSpacing: 0.5,
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, overflow: 'hidden',
  },
  tierLabel: { color: Colors.textDim, fontSize: 10, fontFamily: Fonts.hud, letterSpacing: 1 },
  tierLabelActive: { color: Colors.text },
  tierPrice: { color: Colors.textDim, fontSize: 18, fontFamily: Fonts.hud, fontWeight: '700' },
  tierPriceActive: { color: Colors.gold },
  tierPer: { color: Colors.textDim, fontSize: 10 },
  tierNote: { color: Colors.textDim, fontSize: 12, textAlign: 'center' },
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

  soonBox: {
    width: '100%', backgroundColor: Colors.bgInset, borderRadius: 12,
    paddingVertical: 15, paddingHorizontal: 18, marginTop: 4,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  soonText: { color: Colors.text, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  secureNote: { color: Colors.textDim, fontSize: 11, textAlign: 'center' },
  legalNote: { color: Colors.textDim, fontSize: 10, textAlign: 'center', marginTop: 6, lineHeight: 15 },
  legalLink: { color: Colors.lavender, textDecorationLine: 'underline' },

  dismissWrap: { paddingVertical: 4 },
  dismiss: { color: Colors.textDim, fontSize: 13 },
});
