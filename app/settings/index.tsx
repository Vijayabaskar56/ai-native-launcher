import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-app-theme';
import { Preference, PreferenceCategory } from '@/components/preferences';
import { SETTINGS_LABELS } from '@/constants/settings-labels';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const renderIcon = (name: keyof typeof MaterialCommunityIcons.glyphMap) => (
    <MaterialCommunityIcons name={name} size={24} color={colors.accent} />
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, paddingTop: insets.top + 16 }]}>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons name="cog" size={24} color={colors.text} />
            <View style={styles.titleContainer}>
              <View style={[styles.titleUnderline, { backgroundColor: colors.accent }]} />
            </View>
          </View>
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <PreferenceCategory>
            <Preference
              title={SETTINGS_LABELS.preference_screen_appearance}
              summary={SETTINGS_LABELS.preference_screen_appearance_summary}
              icon={renderIcon('palette')}
              onClick={() => router.push('/settings/appearance')}
            />
            <Preference
              title={SETTINGS_LABELS.preference_screen_homescreen}
              summary={SETTINGS_LABELS.preference_screen_homescreen_summary}
              icon={renderIcon('home')}
              onClick={() => router.push('/settings/homescreen')}
            />
            <Preference
              title={SETTINGS_LABELS.preference_screen_icons}
              summary={SETTINGS_LABELS.preference_screen_icons_summary}
              icon={renderIcon('apps')}
              onClick={() => router.push('/settings/icons')}
            />
            <Preference
              title={SETTINGS_LABELS.preference_screen_gestures}
              summary={SETTINGS_LABELS.preference_screen_gestures_summary}
              icon={renderIcon('gesture')}
              onClick={() => router.push('/settings/gestures')}
            />
            <Preference
              title={SETTINGS_LABELS.preference_screen_locale}
              summary={SETTINGS_LABELS.preference_screen_locale_summary}
              icon={renderIcon('translate')}
              onClick={() => router.push('/settings/locale')}
            />
          </PreferenceCategory>

          <PreferenceCategory title="More">
            <Preference
              title={SETTINGS_LABELS.preference_screen_about}
              summary={SETTINGS_LABELS.preference_screen_about_summary}
              icon={renderIcon('information')}
              onClick={() => router.push('/settings/about')}
            />
          </PreferenceCategory>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleUnderline: {
    height: 3,
    width: 60,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
});
