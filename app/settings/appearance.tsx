import { View, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-app-theme';
import { useSettings } from '@/db';
import {
  PreferenceScreen,
  PreferenceCategory,
  ListPreference,
  Preference,
} from '@/components/preferences';
import { SETTINGS_LABELS, THEME_OPTIONS } from '@/constants/settings-labels';
import type { ColorScheme } from '@/db/use-settings';

export default function AppearanceSettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { settings, updateSetting } = useSettings();

  const renderIcon = (name: keyof typeof MaterialCommunityIcons.glyphMap) => (
    <MaterialCommunityIcons name={name} size={24} color={colors.accent} />
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PreferenceScreen
        title={SETTINGS_LABELS.preference_screen_appearance}
        onBack={() => router.back()}
      >
        <View style={styles.content}>
          <PreferenceCategory>
            <ListPreference
              title={SETTINGS_LABELS.preference_theme}
              items={THEME_OPTIONS}
              value={settings.uiColorScheme}
              onValueChanged={(value) => updateSetting('uiColorScheme', value as ColorScheme)}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Theming">
            <Preference
              title={SETTINGS_LABELS.preference_screen_colors}
              summary="Default"
              icon={renderIcon('palette')}
              onClick={() => {}}
            />
            <Preference
              title={SETTINGS_LABELS.preference_screen_typography}
              summary="Default"
              icon={renderIcon('format-font')}
              onClick={() => {}}
            />
            <Preference
              title={SETTINGS_LABELS.preference_screen_shapes}
              summary="Default"
              icon={renderIcon('crop-square')}
              onClick={() => {}}
            />
            <Preference
              title={SETTINGS_LABELS.preference_screen_transparencies}
              summary="Default"
              icon={renderIcon('opacity')}
              onClick={() => {}}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Import/Export">
            <Preference
              title={SETTINGS_LABELS.theme_import_title}
              icon={renderIcon('download')}
              onClick={() => {}}
            />
            <Preference
              title={SETTINGS_LABELS.theme_export_title}
              icon={renderIcon('upload')}
              onClick={() => {}}
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
