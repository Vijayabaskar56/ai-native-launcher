import { View, StyleSheet, Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-app-theme';
import { PreferenceScreen, PreferenceCategory, Preference } from '@/components/preferences';
import { SETTINGS_LABELS } from '@/constants/settings-labels';
import Constants from 'expo-constants';

export default function AboutSettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const renderIcon = (name: keyof typeof MaterialCommunityIcons.glyphMap) => (
    <MaterialCommunityIcons name={name} size={24} color={colors.accent} />
  );

  const version = Constants.expoConfig?.version || '1.0.0';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PreferenceScreen
        title={SETTINGS_LABELS.preference_screen_about}
        onBack={() => router.back()}
      >
        <View style={styles.content}>
          <View style={styles.appInfo}>
            <View style={[styles.appIcon, { backgroundColor: colors.accent }]}>
              <MaterialCommunityIcons name="rocket-launch" size={48} color={colors.background} />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>Claw Launcher</Text>
            <Text style={[styles.version, { color: colors.textSecondary }]}>Version {version}</Text>
          </View>

          <PreferenceCategory title="Information">
            <Preference
              title={SETTINGS_LABELS.preference_screen_buildinfo}
              summary={SETTINGS_LABELS.preference_screen_buildinfo_summary}
              icon={renderIcon('information')}
              onClick={() => {}}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Legal">
            <Preference
              title="Open Source Licenses"
              summary="View license information"
              icon={renderIcon('file-document')}
              onClick={() => {}}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Credits">
            <Preference
              title="Kvaesitso"
              summary="Reference implementation"
              icon={renderIcon('github')}
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
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
  },
});
