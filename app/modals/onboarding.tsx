import React, { useState, useRef } from 'react';
import {
  View, ScrollView, StyleSheet, TextInput, TouchableOpacity,
  Animated, Image, Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usePetStore } from '../../store/petStore';
import { PixelText } from '../../components/pixel/PixelText';
import { RetroButton } from '../../components/ui/RetroButton';
import { Colors } from '../../constants/colors';
import type { PetSpecies } from '../../types';

const { width } = Dimensions.get('window');

const SPECIES_OPTIONS: { species: PetSpecies; emoji: string; label: string }[] = [
  { species: 'dog', emoji: '🐕', label: 'Dog' },
  { species: 'cat', emoji: '🐈', label: 'Cat' },
  { species: 'rabbit', emoji: '🐇', label: 'Rabbit' },
  { species: 'bird', emoji: '🐦', label: 'Bird' },
  { species: 'reptile', emoji: '🦎', label: 'Reptile' },
  { species: 'other', emoji: '🐾', label: 'Other' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<PetSpecies | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const createPet = usePetStore(s => s.createPet);

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(slideAnim, { toValue: -(step + 1) * width, duration: 300, useNativeDriver: true }).start();
    setStep(s => s + 1);
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!species) return;
    setIsGenerating(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Simulate AI pixel art generation delay
    await new Promise(r => setTimeout(r, 2000));

    createPet(petName || 'Pixel Pal', species, photoUri);
    router.replace('/(tabs)/home');
  };

  return (
    <LinearGradient colors={[Colors.bg.deep, Colors.bg.dark, Colors.bg.mid]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>

        {/* Progress dots */}
        <View style={styles.dots}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[styles.dot, step >= i && styles.dotActive]} />
          ))}
        </View>

        <Animated.View style={[styles.slides, { transform: [{ translateX: slideAnim }] }]}>
          {/* Step 0: Welcome */}
          <View style={[styles.slide, { width }]}>
            <PixelText size={56} style={styles.centerText}>🐾</PixelText>
            <PixelText variant="title" size={28} color={Colors.neon.pink} glow style={styles.centerText}>
              PETAGOTCHI
            </PixelText>
            <PixelText size={13} color={Colors.pastel.purple} style={[styles.centerText, styles.subtitle]}>
              Transform your real pet into{'\n'}an adorable pixel creature!
            </PixelText>
            <View style={styles.featureList}>
              {[
                ['🎮', 'AI pixel art transformation'],
                ['💕', 'Raise & evolve your digital pet'],
                ['🏆', 'Mini games & competitions'],
                ['✨', 'Seasonal events & rare cosmetics'],
              ].map(([emoji, text]) => (
                <View key={text} style={styles.featureRow}>
                  <PixelText size={16}>{emoji}</PixelText>
                  <PixelText size={13} color={Colors.ui.text}>{text}</PixelText>
                </View>
              ))}
            </View>
            <RetroButton label="Start Adventure" onPress={goNext} color={Colors.neon.pink} size="lg" emoji="✨" />
          </View>

          {/* Step 1: Name */}
          <View style={[styles.slide, { width }]}>
            <PixelText size={48} style={styles.centerText}>📝</PixelText>
            <PixelText variant="title" size={20} color={Colors.neon.cyan} glow style={styles.centerText}>
              Name Your Pet
            </PixelText>
            <PixelText size={13} color={Colors.ui.textDim} style={[styles.centerText, styles.subtitle]}>
              What's your real pet's name?
            </PixelText>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mochi, Biscuit, Luna..."
              placeholderTextColor={Colors.ui.textDim}
              value={petName}
              onChangeText={setPetName}
              maxLength={20}
              autoCapitalize="words"
            />
            <RetroButton
              label="Next"
              onPress={goNext}
              color={Colors.neon.cyan}
              size="lg"
              emoji="→"
              disabled={!petName.trim()}
            />
          </View>

          {/* Step 2: Species */}
          <View style={[styles.slide, { width }]}>
            <PixelText size={48} style={styles.centerText}>🐾</PixelText>
            <PixelText variant="title" size={20} color={Colors.neon.yellow} glow style={styles.centerText}>
              Pick a Species
            </PixelText>
            <PixelText size={13} color={Colors.ui.textDim} style={[styles.centerText, styles.subtitle]}>
              What kind of animal is {petName || 'your pet'}?
            </PixelText>
            <View style={styles.speciesGrid}>
              {SPECIES_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.species}
                  style={[styles.speciesBtn, species === opt.species && styles.speciesBtnActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSpecies(opt.species);
                  }}
                >
                  <PixelText size={32}>{opt.emoji}</PixelText>
                  <PixelText size={11} color={species === opt.species ? Colors.neon.yellow : Colors.ui.textDim}>
                    {opt.label}
                  </PixelText>
                </TouchableOpacity>
              ))}
            </View>
            <RetroButton
              label="Next"
              onPress={goNext}
              color={Colors.neon.yellow}
              size="lg"
              emoji="→"
              disabled={!species}
            />
          </View>

          {/* Step 3: Photo */}
          <View style={[styles.slide, { width }]}>
            <PixelText size={48} style={styles.centerText}>📸</PixelText>
            <PixelText variant="title" size={20} color={Colors.neon.purple} glow style={styles.centerText}>
              Upload a Photo
            </PixelText>
            <PixelText size={13} color={Colors.ui.textDim} style={[styles.centerText, styles.subtitle]}>
              AI will transform {petName || 'your pet'}{'\n'}into an adorable pixel creature!
            </PixelText>

            <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <PixelText size={40}>📷</PixelText>
                  <PixelText size={12} color={Colors.ui.textDim}>Tap to upload photo</PixelText>
                  <PixelText size={10} color={Colors.ui.textDim}>(optional but makes it cuter!)</PixelText>
                </View>
              )}
            </TouchableOpacity>

            {isGenerating ? (
              <View style={styles.generatingBox}>
                <PixelText size={24} style={styles.centerText}>✨</PixelText>
                <PixelText size={14} color={Colors.neon.purple} glow style={styles.centerText}>
                  AI is pixelating {petName}...
                </PixelText>
                <PixelText size={11} color={Colors.ui.textDim} style={styles.centerText}>
                  Analyzing fur, eyes & expressions
                </PixelText>
              </View>
            ) : (
              <RetroButton
                label={photoUri ? 'Transform!' : 'Skip & Create'}
                onPress={handleCreate}
                color={Colors.neon.purple}
                size="lg"
                emoji="✨"
              />
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 60,
    paddingBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.ui.border,
  },
  dotActive: {
    backgroundColor: Colors.neon.pink,
    shadowColor: Colors.neon.pink,
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  slides: {
    flexDirection: 'row',
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  centerText: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  featureList: {
    width: '100%',
    gap: 10,
    marginVertical: 8,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  input: {
    width: '100%',
    backgroundColor: Colors.bg.card,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.ui.textBright,
    fontSize: 16,
    letterSpacing: 1,
  },
  speciesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
    marginVertical: 8,
  },
  speciesBtn: {
    width: 85,
    height: 85,
    backgroundColor: Colors.bg.card,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  speciesBtnActive: {
    borderColor: Colors.neon.yellow,
    backgroundColor: Colors.bg.mid,
    shadowColor: Colors.neon.yellow,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  photoBox: {
    width: 180,
    height: 180,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: Colors.neon.purple,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.card,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  generatingBox: {
    gap: 8,
    alignItems: 'center',
  },
});
