import { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-app-theme';
import { PreferenceCategory, Preference } from '@/components/preferences';
import { SETTINGS_LABELS } from '@/constants/settings-labels';
import type { PluginInfo } from '@/core/types/settings';

const PLUGIN_LABELS = {
  no_plugins: 'No plugins installed',
  no_plugins_summary: 'Plugins extend the launcher with additional features',
  browse_plugins: 'Browse plugins',
  version: 'Version',
  author: 'Author',
  disable: 'Disable',
  enable: 'Enable',
  plugin_settings: 'Settings',
};

const MOCK_PLUGINS: PluginInfo[] = [
  // Empty for now - would be populated from native module
];

export default function PluginsSettingsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [plugins, setPlugins] = useState<PluginInfo[]>(MOCK_PLUGINS);

  const togglePlugin = (pluginId: string, enabled: boolean) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === pluginId ? { ...p, enabled } : p))
    );
  };

  const renderIcon = (name: keyof typeof MaterialCommunityIcons.glyphMap) => (
    <MaterialCommunityIcons name={name} size={24} color={colors.accent} />
  );

  const renderPlugin = (plugin: PluginInfo) => (
    <View
      key={plugin.id}
      style={[styles.pluginItem, { backgroundColor: colors.surface }]}
    >
      <View style={styles.pluginInfo}>
        <View style={styles.pluginHeader}>
          <Text style={[styles.pluginName, { color: colors.text }]}>{plugin.name}</Text>
          <Pressable
            style={[
              styles.toggleButton,
              { backgroundColor: plugin.enabled ? colors.accent : colors.border },
            ]}
            onPress={() => togglePlugin(plugin.id, !plugin.enabled)}
          >
            <Text style={[styles.toggleText, { color: plugin.enabled ? colors.background : colors.text }]}>
              {plugin.enabled ? PLUGIN_LABELS.disable : PLUGIN_LABELS.enable}
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.pluginMeta, { color: colors.textSecondary }]}>
          {PLUGIN_LABELS.author}: {plugin.author}
        </Text>
        <Text style={[styles.pluginMeta, { color: colors.textSecondary }]}>
          {PLUGIN_LABELS.version}: {plugin.version}
        </Text>
        {plugin.hasSettings && (
          <Pressable style={styles.settingsButton}>
            <MaterialCommunityIcons name="cog" size={18} color={colors.accent} />
            <Text style={[styles.settingsText, { color: colors.accent }]}>
              {PLUGIN_LABELS.plugin_settings}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: SETTINGS_LABELS.preference_screen_plugins,
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
          {plugins.length > 0 ? (
            <PreferenceCategory title="Installed Plugins">
              {plugins.map(renderPlugin)}
            </PreferenceCategory>
          ) : (
            <PreferenceCategory>
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="puzzle-outline"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {PLUGIN_LABELS.no_plugins}
                </Text>
                <Text style={[styles.emptySummary, { color: colors.textSecondary }]}>
                  {PLUGIN_LABELS.no_plugins_summary}
                </Text>
              </View>
            </PreferenceCategory>
          )}

          <PreferenceCategory title="Discover">
            <Preference
              title={PLUGIN_LABELS.browse_plugins}
              icon={renderIcon('store')}
              onClick={() => {}}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  pluginItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  pluginInfo: {
    flex: 1,
  },
  pluginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pluginName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  pluginMeta: {
    fontSize: 12,
    marginBottom: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  settingsText: {
    fontSize: 14,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySummary: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});