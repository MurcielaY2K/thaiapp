import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" backgroundColor="#0d0d1a" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="lesson" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="session" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="write" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="read" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0d0d1a' },
});
