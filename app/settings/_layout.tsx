import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        presentation: 'card',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="homescreen" />
      <Stack.Screen name="icons" />
      <Stack.Screen name="gestures" />
      <Stack.Screen name="locale" />
      <Stack.Screen name="about" />
    </Stack>
  );
}
