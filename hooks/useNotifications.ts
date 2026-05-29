import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Pet } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function requestPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

async function cancelPetNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

async function schedulePetNotifications(pet: Pet) {
  await cancelPetNotifications();
  const granted = await requestPermission();
  if (!granted) return;

  const name = pet.name;

  // 4-hour neglect warning
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${name} is wondering where you are! 🥺`,
      body: `Your ${pet.species} hasn't been fed or played with in a while...`,
      sound: true,
      data: { type: 'neglect_warning' },
    },
    trigger: { seconds: 4 * 60 * 60, repeats: false } as any,
  });

  // 8-hour critical warning
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `⚠️ ${name} is getting grumpy!`,
      body: `Neglect too long and ${name} might turn into a gremlin! 👺`,
      sound: true,
      data: { type: 'neglect_critical' },
    },
    trigger: { seconds: 8 * 60 * 60, repeats: false } as any,
  });

  // Daily reminder at 10am
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Good morning! ${name} wants to see you! ☀️`,
      body: 'Check in to keep your pet happy and evolving!',
      sound: true,
      data: { type: 'daily_reminder' },
    },
    trigger: {
      hour: 10,
      minute: 0,
      repeats: true,
    } as any,
  });
}

export function useNotifications(pet: Pet | null) {
  useEffect(() => {
    if (!pet || Platform.OS === 'web') return;
    schedulePetNotifications(pet);

    return () => {
      schedulePetNotifications(pet);
    };
  }, [pet?.id, pet?.lastInteraction]);
}
