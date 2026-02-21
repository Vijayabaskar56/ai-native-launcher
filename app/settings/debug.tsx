import { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-app-theme';
import { PreferenceCategory, Preference } from '@/components/preferences';
import { SETTINGS_LABELS } from '@/constants/settings-labels';

const DEBUG_LABELS = {
  logs: 'View logs',
  logs_summary: 'View application logs',
  crash_reports: 'Crash reports',
  crash_reports_summary: 'View recent crash reports',
  debug_mode: 'Debug mode',
  debug_mode_summary: 'Enable verbose logging',
  show_fps: 'Show FPS',
  show_fps_summary: 'Display frame rate overlay',
  clear_cache: 'Clear cache',
  clear_cache_summary: 'Clear temporary files and caches',
  reset_settings: 'Reset settings',
  reset_settings_summary: 'Reset all settings to defaults',
  app_version: 'App version',
  build_type: 'Build type',
  device_info: 'Device info',
  no_crash_reports: 'No crash reports',
  cache_cleared: 'Cache cleared',
  settings_reset: 'Settings reset to defaults',
  confirm_reset: 'Reset Settings?',
  confirm_reset_message: 'This will reset all settings to their default values. This action cannot be undone.',
};

export default function DebugSettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [debugMode, setDebugMode] = useState(false);
  const [showFps, setShowFps] = useState(false);

  const renderIcon = (name: keyof typeof MaterialCommunityIcons.glyphMap) => (
    <MaterialCommunityIcons name={name} size={24} color={colors.accent} />
  );

  const handleClearCache = () => {
    console.log('Clearing cache...');
  };

  const handleResetSettings = () => {};

  const getVersionInfo = () => {
    return '1.0.0';
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: SETTINGS_LABELS.preference_screen_debug,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <PreferenceCategory title="Logging">
            <Preference
              title={DEBUG_LABELS.logs}
              summary={DEBUG_LABELS.logs_summary}
              icon={renderIcon('text-box')}
              onClick={() => {}}
            />
            <Preference
              title={DEBUG_LABELS.crash_reports}
              summary={DEBUG_LABELS.crash_reports_summary}
              icon={renderIcon('alert-circle')}
              onClick={() => {}}
            />
          </PreferenceCategory>

          <PreferenceCategory title="Developer Options">
            <View style={[styles.toggleCard, { backgroundColor: colors.surface }]}>
              <View style={styles.toggleContent}>
                <View style={styles.toggleIcon}>
                  {renderIcon('bug')}
                </View>
                <View style={styles.toggleText}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>
                    {DEBUG_LABELS.debug_mode}
                  </Text>
                  <Text style={[styles.toggleSummary, { color: colors.textSecondary }]}>
                    {DEBUG_LABELS.debug_mode_summary}
                  </Text>
                </View>
              </View>
              <Pressable
                style={[
                  styles.toggleSwitch,
                  { backgroundColor: debugMode ? colors.accent : colors.border },
                ]}
                onPress={() => setDebugMode(!debugMode)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: debugMode ? colors.background : colors.surface,
                      transform: [{ translateX: debugMode ? 20 : 0 }],
                    },
                  ]}
                />
              </Pressable>
            </View>

            <View style={[styles.toggleCard, { backgroundColor: colors.surface }]}>
              <View style={styles.toggleContent}>
                <View style={styles.toggleIcon}>
                  {renderIcon('speedometer')}
                </View>
                <View style={styles.toggleText}>
                  <Text style={[styles.toggleTitle, { color: colors.text }]}>
                    {DEBUG_LABELS.show_fps}
                  </Text>
                  <Text style={[styles.toggleSummary, { color: colors.textSecondary }]}>
                    {DEBUG_LABELS.show_fps_summary}
                  </Text>
                </View>
              </View>
              <Pressable
                style={[
                  styles.toggleSwitch,
                  { backgroundColor: showFps ? colors.accent : colors.border },
                ]}
                onPress={() => setShowFps(!showFps)}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: showFps ? colors.background : colors.surface,
                      transform: [{ translateX: showFps ? 20 : 0 }],
                    },
                  ]}
                />
              </Pressable>
            </View>
          </PreferenceCategory>

          <PreferenceCategory title="Maintenance">
            <Preference
              title={DEBUG_LABELS.clear_cache}
              summary={DEBUG_LABELS.clear_cache_summary}
              icon={renderIcon('delete-sweep')}
              onClick={handleClearCache}
            />
            <Preference
              title={DEBUG_LABELS.reset_settings}
              summary={DEBUG_LABELS.reset_settings_summary}
              icon={renderIcon('refresh')}
              onClick={handleResetSettings}
            />
          </PreferenceCategory>

          <PreferenceCategory title="System Info">
            <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {DEBUG_LABELS.app_version}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {getVersionInfo()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {DEBUG_LABELS.build_type}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  Debug
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {DEBUG_LABELS.device_info}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  Android API 34
                </Text>
              </View>
            </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleIcon: {
    marginRight: 12,
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleSummary: {
    fontSize: 14,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 4,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});