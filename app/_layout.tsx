import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/hooks/use-app-theme';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
        <StatusBar hidden />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
