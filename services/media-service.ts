import { Platform } from 'react-native';
import LauncherKit, { type MediaSessionData } from '@/modules/launcher-kit/src';

export type { MediaSessionData };

export async function isMediaAccessGranted(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    return await LauncherKit.isNotificationAccessGranted();
  } catch {
    return false;
  }
}

export async function openMediaAccessSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await LauncherKit.openNotificationAccessSettings();
}

export async function getActiveSession(): Promise<MediaSessionData | null> {
  if (Platform.OS !== 'android') return null;
  try {
    return await LauncherKit.getActiveMediaSession();
  } catch {
    return null;
  }
}

export async function startListening(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await LauncherKit.startMediaListening();
}

export async function playPause(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await LauncherKit.playPause();
}

export async function skipNext(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await LauncherKit.skipNext();
}

export async function skipPrevious(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await LauncherKit.skipPrevious();
}

export function addMediaSessionListener(callback: (data: MediaSessionData) => void) {
  return LauncherKit.addMediaSessionListener(callback);
}
