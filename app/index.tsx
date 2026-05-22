import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { usePetStore } from '../store/petStore';
import { Colors } from '../constants/colors';

export default function SplashRouter() {
  const { pet, isLoading } = usePetStore();

  useEffect(() => {
    if (isLoading) return;
    if (pet) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/modals/onboarding');
    }
  }, [isLoading, pet]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.neon.pink} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.deep,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
