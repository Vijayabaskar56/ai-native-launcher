import '../src/global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/hooks/use-app-theme';
import { DatabaseProvider } from '@/db';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

// Lazy-load permission modules to avoid crash if native modules aren't built yet
let Calendar: typeof import('expo-calendar') | null = null;
let Location: typeof import('expo-location') | null = null;
try { Calendar = require('expo-calendar'); } catch {}
try { Location = require('expo-location'); } catch {}

/** Request all permissions the launcher needs, once at startup. */
async function requestPermissionsUpfront() {
  if (Platform.OS !== 'android') return;

  await Promise.allSettled([
    Calendar?.requestCalendarPermissionsAsync(),
    Location?.requestForegroundPermissionsAsync(),
  ]);
}

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  useEffect(() => {
    requestPermissionsUpfront().finally(() => SplashScreen.hideAsync());
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
          <StatusBar hidden />
        </ThemeProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
}
