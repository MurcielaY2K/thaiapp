import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { usePetStore } from '../store/petStore';

export default function RootLayout() {
  const loadPet = usePetStore(s => s.loadPet);

  useEffect(() => {
    loadPet();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" backgroundColor="#0d0520" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modals/onboarding" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="modals/evolution" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="modals/shop" options={{ presentation: 'modal', animation: 'slide_from_right' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
