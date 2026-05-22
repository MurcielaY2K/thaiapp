import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePetStore } from '../../store/petStore';
import { PixelText } from '../../components/pixel/PixelText';
import { PixelPet } from '../../components/pixel/PixelPet';
import { RetroButton } from '../../components/ui/RetroButton';
import { Colors } from '../../constants/colors';
import { ACCESSORIES, ROOM_THEMES, PIXEL_STYLES } from '../../constants/petData';
import type { Accessory } from '../../types';

type ShopTab = 'accessories' | 'themes' | 'styles' | 'premium';

const RARITY_COLORS = {
  common: Colors.ui.textDim,
  rare: Colors.neon.cyan,
  legendary: Colors.neon.yellow,
};

export default function ShopScreen() {
  const { pet, coins, gems, purchaseItem, equipAccessory, removeAccessory, setRoomTheme, setPixelStyle } = usePetStore();
  const [tab, setTab] = useState<ShopTab>('accessories');

  if (!pet) return null;

  const handleBuy = (item: Accessory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = purchaseItem(item.price, item.currency);
    if (success) {
      equipAccessory(item.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Not enough!',
        `You need ${item.price} ${item.currency === 'coins' ? '🪙 coins' : '💎 gems'}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header with currency */}
      <View style={styles.header}>
        <PixelText variant="title" size={18} color={Colors.neon.yellow} glow>🛍️  SHOP</PixelText>
        <View style={styles.currencyRow}>
          <View style={styles.currencyBadge}>
            <PixelText size={14}>🪙</PixelText>
            <PixelText size={13} color={Colors.neon.yellow}>{coins}</PixelText>
          </View>
          <View style={styles.currencyBadge}>
            <PixelText size={14}>💎</PixelText>
            <PixelText size={13} color={Colors.neon.cyan}>{gems}</PixelText>
          </View>
        </View>
      </View>

      {/* Pet preview */}
      <View style={styles.previewBox}>
        <PixelPet pet={pet} size={90} />
        <View style={{ gap: 4 }}>
          <PixelText size={13} color={Colors.ui.textBright}>{pet.name}'s Preview</PixelText>
          <PixelText size={11} color={Colors.ui.textDim}>
            Equipped: {pet.accessories.length > 0 ? pet.accessories.join(', ') : 'nothing'}
          </PixelText>
          <PixelText size={11} color={Colors.ui.textDim}>Room: {ROOM_THEMES[pet.roomTheme].name}</PixelText>
          <PixelText size={11} color={Colors.ui.textDim}>Style: {PIXEL_STYLES[pet.pixelStyle].name}</PixelText>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['accessories', 'themes', 'styles', 'premium'] as ShopTab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => { Haptics.selectionAsync(); setTab(t); }}
          >
            <PixelText size={9} color={tab === t ? Colors.neon.yellow : Colors.ui.textDim} style={{ letterSpacing: 0.8 }}>
              {t.toUpperCase()}
            </PixelText>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {tab === 'accessories' && (
          <View style={styles.grid}>
            {ACCESSORIES.map(item => {
              const owned = pet.accessories.includes(item.id);
              return (
                <View key={item.id} style={[styles.itemCard, owned && styles.itemOwned]}>
                  <PixelText size={36}>{item.emoji}</PixelText>
                  <PixelText size={12} color={Colors.ui.textBright}>{item.name}</PixelText>
                  <PixelText size={9} color={RARITY_COLORS[item.rarity]} style={{ letterSpacing: 1 }}>
                    {item.rarity.toUpperCase()}
                  </PixelText>
                  {owned ? (
                    <View style={styles.ownedBadge}>
                      <PixelText size={9} color={Colors.neon.green}>✓ OWNED</PixelText>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.buyBtn}
                      onPress={() => handleBuy(item)}
                    >
                      <PixelText size={11} color={item.currency === 'gems' ? Colors.neon.cyan : Colors.neon.yellow}>
                        {item.currency === 'gems' ? '💎' : '🪙'} {item.price}
                      </PixelText>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {tab === 'themes' && (
          <View style={styles.section}>
            <PixelText size={12} color={Colors.ui.textDim}>Choose your pet's world!</PixelText>
            {Object.entries(ROOM_THEMES).map(([key, theme]) => {
              const active = pet.roomTheme === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.themeCard, active && styles.themeCardActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setRoomTheme(key as any);
                  }}
                >
                  <PixelText size={28}>{theme.emoji}</PixelText>
                  <View style={{ flex: 1 }}>
                    <PixelText size={13} color={active ? Colors.neon.yellow : Colors.ui.textBright}>
                      {theme.name}
                    </PixelText>
                    <View style={styles.colorPreview}>
                      {theme.bgColors.map((c, i) => (
                        <View key={i} style={[styles.colorDot, { backgroundColor: c }]} />
                      ))}
                    </View>
                  </View>
                  {active && <PixelText size={18} color={Colors.neon.green}>✓</PixelText>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {tab === 'styles' && (
          <View style={styles.section}>
            <PixelText size={12} color={Colors.ui.textDim}>Choose your pixel art evolution style!</PixelText>
            {Object.entries(PIXEL_STYLES).map(([key, style]) => {
              const active = pet.pixelStyle === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.themeCard, active && styles.themeCardActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPixelStyle(key as any);
                  }}
                >
                  <PixelText size={28}>{style.emoji}</PixelText>
                  <View style={{ flex: 1 }}>
                    <PixelText size={13} color={active ? Colors.neon.yellow : Colors.ui.textBright}>
                      {style.name}
                    </PixelText>
                    <PixelText size={11} color={Colors.ui.textDim}>{style.description}</PixelText>
                  </View>
                  {active && <PixelText size={18} color={Colors.neon.green}>✓</PixelText>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {tab === 'premium' && (
          <View style={styles.section}>
            <View style={styles.premiumBanner}>
              <PixelText size={32}>👑</PixelText>
              <View style={{ gap: 4 }}>
                <PixelText variant="title" size={16} color={Colors.neon.yellow} glow>PETAGOTCHI VIP</PixelText>
                <PixelText size={11} color={Colors.ui.textDim}>Unlock the full pixel kingdom!</PixelText>
              </View>
            </View>

            {[
              { emoji: '✨', title: 'AI Style Packs', desc: 'Exclusive pixel art evolutions', price: '$2.99', highlight: false },
              { emoji: '🌙', title: 'Seasonal Events', desc: 'Halloween, Xmas, Summer events', price: '$1.99', highlight: false },
              { emoji: '💎', title: 'Gem Pack × 50', desc: 'Spend on legendary accessories', price: '$4.99', highlight: true },
              { emoji: '👑', title: 'VIP Monthly', desc: 'Everything + daily gem drops', price: '$7.99/mo', highlight: true },
            ].map((product, i) => (
              <View key={i} style={[styles.productCard, product.highlight && styles.productHighlight]}>
                <PixelText size={28}>{product.emoji}</PixelText>
                <View style={{ flex: 1, gap: 2 }}>
                  <PixelText size={13} color={product.highlight ? Colors.neon.yellow : Colors.ui.textBright}>
                    {product.title}
                  </PixelText>
                  <PixelText size={11} color={Colors.ui.textDim}>{product.desc}</PixelText>
                </View>
                <RetroButton
                  label={product.price}
                  onPress={() => Alert.alert('Coming Soon!', 'IAP integration coming in the next update 🚀')}
                  color={product.highlight ? Colors.neon.yellow : Colors.neon.purple}
                  size="sm"
                />
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg.deep },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.ui.border,
  },
  currencyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
    backgroundColor: Colors.bg.card,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.neon.yellow,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
  },
  itemCard: {
    width: '47%',
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  itemOwned: {
    borderColor: Colors.neon.green,
    backgroundColor: Colors.bg.mid,
  },
  ownedBadge: {
    backgroundColor: 'rgba(57,255,20,0.1)',
    borderRadius: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.neon.green,
  },
  buyBtn: {
    backgroundColor: Colors.bg.mid,
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  section: {
    padding: 16,
    gap: 10,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    padding: 12,
    gap: 12,
  },
  themeCardActive: {
    borderColor: Colors.neon.yellow,
    backgroundColor: Colors.bg.mid,
  },
  colorPreview: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,224,102,0.1)',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.neon.yellow,
    padding: 16,
    marginBottom: 8,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    padding: 12,
    gap: 12,
  },
  productHighlight: {
    borderColor: Colors.neon.yellow,
    backgroundColor: 'rgba(255,224,102,0.05)',
  },
});
