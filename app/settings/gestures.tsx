import { View, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSettings } from '@/db';
import {
  PreferenceScreen,
  PreferenceCategory,
  ListPreference,
} from '@/components/preferences';
import { SETTINGS_LABELS, GESTURE_ACTIONS } from '@/constants/settings-labels';
import type { GestureActionType } from '@/db/use-settings';

export default function GesturesSettingsScreen() {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PreferenceScreen
        title={SETTINGS_LABELS.preference_screen_gestures}
        onBack={() => router.back()}
      >
        <View style={styles.content}>
          <PreferenceCategory>
            <ListPreference
              title={SETTINGS_LABELS.preference_gesture_swipe_down}
              items={GESTURE_ACTIONS}
              value={settings.gesturesSwipeDown}
              onValueChanged={(value) => updateSetting('gesturesSwipeDown', value as GestureActionType)}
            />
            <ListPreference
              title={SETTINGS_LABELS.preference_gesture_swipe_left}
              items={GESTURE_ACTIONS}
              value={settings.gesturesSwipeLeft}
              onValueChanged={(value) => updateSetting('gesturesSwipeLeft', value as GestureActionType)}
            />
            <ListPreference
              title={SETTINGS_LABELS.preference_gesture_swipe_right}
              items={GESTURE_ACTIONS}
              value={settings.gesturesSwipeRight}
              onValueChanged={(value) => updateSetting('gesturesSwipeRight', value as GestureActionType)}
            />
            <ListPreference
              title={SETTINGS_LABELS.preference_gesture_swipe_up}
              items={GESTURE_ACTIONS}
              value={settings.gesturesSwipeUp}
              onValueChanged={(value) => updateSetting('gesturesSwipeUp', value as GestureActionType)}
            />
            <ListPreference
              title={SETTINGS_LABELS.preference_gesture_double_tap}
              items={GESTURE_ACTIONS}
              value={settings.gesturesDoubleTap}
              onValueChanged={(value) => updateSetting('gesturesDoubleTap', value as GestureActionType)}
            />
            <ListPreference
              title={SETTINGS_LABELS.preference_gesture_long_press}
              items={GESTURE_ACTIONS}
              value={settings.gesturesLongPress}
              onValueChanged={(value) => updateSetting('gesturesLongPress', value as GestureActionType)}
            />
            <ListPreference
              title={SETTINGS_LABELS.preference_gesture_home_button}
              items={GESTURE_ACTIONS}
              value={settings.gesturesHomeButton}
              onValueChanged={(value) => updateSetting('gesturesHomeButton', value as GestureActionType)}
            />
          </PreferenceCategory>
        </View>
      </PreferenceScreen>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
});
