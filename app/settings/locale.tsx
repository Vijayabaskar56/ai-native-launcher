import { View, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSettings } from '@/db';
import {
  PreferenceScreen,
  PreferenceCategory,
  ListPreference,
} from '@/components/preferences';
import { SETTINGS_LABELS, TIME_FORMAT_OPTIONS, MEASUREMENT_SYSTEM_OPTIONS } from '@/constants/settings-labels';
import type { TimeFormat, MeasurementSystem } from '@/db/use-settings';

export default function LocaleSettingsScreen() {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PreferenceScreen
        title={SETTINGS_LABELS.preference_screen_locale}
        onBack={() => router.back()}
      >
        <View style={styles.content}>
          <PreferenceCategory>
            <ListPreference
              title={SETTINGS_LABELS.preference_time_format}
              items={TIME_FORMAT_OPTIONS}
              value={settings.localeTimeFormat}
              onValueChanged={(value) => updateSetting('localeTimeFormat', value as TimeFormat)}
            />
            <ListPreference
              title={SETTINGS_LABELS.preference_measurement_system}
              items={MEASUREMENT_SYSTEM_OPTIONS}
              value={settings.localeMeasurementSystem}
              onValueChanged={(value) => updateSetting('localeMeasurementSystem', value as MeasurementSystem)}
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
