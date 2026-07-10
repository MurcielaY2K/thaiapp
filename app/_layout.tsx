import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import { Colors } from '../constants/colors';
import { initMonitoring } from '../lib/monitoring';
import { useProgressStore } from '../store/progressStore';
import { useSrsStore } from '../store/srsStore';
import { useUserStore } from '../store/userStore';

export default function RootLayout() {
  // Hydrate every store before ANY route renders. Routed screens
  // (/lesson, /session, /write, /read) can be deep-linked directly; if they
  // mounted against un-hydrated stores, their first write would persist the
  // default-state map and wipe the user's saved progress.
  const progressLoaded = useProgressStore(s => s.isLoaded);
  const srsLoading     = useSrsStore(s => s.isLoading);
  const userLoaded     = useUserStore(s => s.isLoaded);
  const hydrated = progressLoaded && !srsLoading && userLoaded;

  useEffect(() => {
    initMonitoring();
    useProgressStore.getState().load();
    useSrsStore.getState().load();
    useUserStore.getState().load();
  }, []);

  if (!hydrated) {
    return <View style={styles.root} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" backgroundColor={Colors.bg} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="lesson" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="session" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="write" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="read" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="privacy" options={{ animation: 'fade' }} />
        <Stack.Screen name="terms" options={{ animation: 'fade' }} />
        <Stack.Screen name="refunds" options={{ animation: 'fade' }} />
        <Stack.Screen name="delete-account" options={{ animation: 'fade' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
});
