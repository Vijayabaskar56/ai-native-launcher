import { useState } from 'react';
import { View, StyleSheet, Modal, Pressable, Text, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '@/hooks/use-app-theme';
import { useSettings } from '@/db';
import {
  PreferenceScreen,
  PreferenceCategory,
  SwitchPreference,
  SliderPreference,
  Preference,
} from '@/components/preferences';
import { SETTINGS_LABELS, ICON_SHAPES } from '@/constants/settings-labels';
import type { IconShape } from '@/db/use-settings';

export default function IconsSettingsScreen() {
  const router = useRouter();
  const { settings, updateSetting } = useSettings();
  const [showShapeDialog, setShowShapeDialog] = useState(false);

  const currentShape = ICON_SHAPES.find(s => s.value === settings.iconsShape);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PreferenceScreen
        title={SETTINGS_LABELS.preference_screen_icons}
        onBack={() => router.back()}
      >
        <View style={styles.content}>
          <PreferenceCategory title={SETTINGS_LABELS.preference_category_grid}>
            <SliderPreference
              title={SETTINGS_LABELS.preference_grid_icon_size}
              value={settings.gridIconSize}
              min={32}
              max={64}
              step={8}
              onValueChanged={(value) => updateSetting('gridIconSize', value)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_grid_labels}
              summary={SETTINGS_LABELS.preference_grid_labels_summary}
              value={settings.gridLabels}
              onValueChanged={(value) => updateSetting('gridLabels', value)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_grid_list_style}
              summary={SETTINGS_LABELS.preference_grid_list_style_summary}
              value={settings.gridList}
              onValueChanged={(value) => updateSetting('gridList', value)}
            />
            {settings.gridList && (
              <SwitchPreference
                title={SETTINGS_LABELS.preference_grid_list_icons}
                summary={SETTINGS_LABELS.preference_grid_list_icons_summary}
                value={settings.gridListIcons}
                onValueChanged={(value) => updateSetting('gridListIcons', value)}
              />
            )}
            <SliderPreference
              title={SETTINGS_LABELS.preference_grid_column_count}
              value={settings.gridColumnCount}
              min={3}
              max={12}
              step={1}
              onValueChanged={(value) => updateSetting('gridColumnCount', value)}
            />
          </PreferenceCategory>

          <PreferenceCategory title={SETTINGS_LABELS.preference_category_icons}>
            <Preference
              title={SETTINGS_LABELS.preference_icon_shape}
              summary={currentShape?.label || SETTINGS_LABELS.preference_value_system_default}
              onClick={() => setShowShapeDialog(true)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_enforce_icon_shape}
              summary={SETTINGS_LABELS.preference_enforce_icon_shape_summary}
              value={settings.iconsAdaptify}
              onValueChanged={(value) => updateSetting('iconsAdaptify', value)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_themed_icons}
              summary={SETTINGS_LABELS.preference_themed_icons_summary}
              value={settings.iconsThemed}
              onValueChanged={(value) => updateSetting('iconsThemed', value)}
            />
            {settings.iconsThemed && (
              <SwitchPreference
                title={SETTINGS_LABELS.preference_force_themed_icons}
                summary={SETTINGS_LABELS.preference_force_themed_icons_summary}
                value={settings.iconsForceThemed}
                onValueChanged={(value) => updateSetting('iconsForceThemed', value)}
              />
            )}
            <Preference
              title={SETTINGS_LABELS.preference_icon_pack}
              summary={SETTINGS_LABELS.preference_icon_pack_summary_empty}
              onClick={() => {}}
            />
          </PreferenceCategory>

          <PreferenceCategory title={SETTINGS_LABELS.preference_category_badges}>
            <SwitchPreference
              title={SETTINGS_LABELS.preference_notification_badges}
              summary={SETTINGS_LABELS.preference_notification_badges_summary}
              value={settings.badgesNotifications}
              onValueChanged={(value) => updateSetting('badgesNotifications', value)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_cloud_badges}
              summary={SETTINGS_LABELS.preference_cloud_badges_summary}
              value={settings.badgesCloudFiles}
              onValueChanged={(value) => updateSetting('badgesCloudFiles', value)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_suspended_badges}
              summary={SETTINGS_LABELS.preference_suspended_badges_summary}
              value={settings.badgesSuspendedApps}
              onValueChanged={(value) => updateSetting('badgesSuspendedApps', value)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_shortcut_badges}
              summary={SETTINGS_LABELS.preference_shortcut_badges_summary}
              value={settings.badgesShortcuts}
              onValueChanged={(value) => updateSetting('badgesShortcuts', value)}
            />
            <SwitchPreference
              title={SETTINGS_LABELS.preference_plugin_badges}
              summary={SETTINGS_LABELS.preference_plugin_badges_summary}
              value={settings.badgesPlugins}
              onValueChanged={(value) => updateSetting('badgesPlugins', value)}
            />
          </PreferenceCategory>
        </View>
      </PreferenceScreen>

      {showShapeDialog && (
        <IconShapeDialog
          value={settings.iconsShape}
          onSelect={(value) => {
            updateSetting('iconsShape', value);
            setShowShapeDialog(false);
          }}
          onDismiss={() => setShowShapeDialog(false)}
        />
      )}
    </>
  );
}

function IconShapeDialog({
  value,
  onSelect,
  onDismiss,
}: {
  value: IconShape;
  onSelect: (value: IconShape) => void;
  onDismiss: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={shapeStyles.overlay} onPress={onDismiss}>
        <View style={[shapeStyles.dialog, { backgroundColor: colors.surface }]}>
          <Text style={[shapeStyles.title, { color: colors.text }]}>
            {SETTINGS_LABELS.preference_icon_shape}
          </Text>
          <FlatList
            data={ICON_SHAPES}
            numColumns={5}
            keyExtractor={(item) => item.value}
            contentContainerStyle={shapeStyles.grid}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  style={shapeStyles.shapeItem}
                  onPress={() => onSelect(item.value)}
                >
                  <View
                    style={[
                      shapeStyles.shapePreview,
                      { backgroundColor: isSelected ? colors.accent : colors.border },
                      item.value === 'Circle' && { borderRadius: 24 },
                      item.value === 'Square' && { borderRadius: 0 },
                      item.value === 'RoundedSquare' && { borderRadius: 8 },
                      item.value === 'Squircle' && { borderRadius: 16 },
                      item.value === 'Triangle' && {
                        transform: [{ rotate: '45deg' }],
                        width: 34,
                        height: 34,
                      },
                      item.value === 'Pentagon' && { borderRadius: 4 },
                      item.value === 'Hexagon' && { borderRadius: 6 },
                      item.value === 'Teardrop' && {
                        borderRadius: 24,
                        borderTopLeftRadius: 4,
                      },
                      item.value === 'Pebble' && {
                        borderRadius: 20,
                        borderBottomLeftRadius: 8,
                        borderTopRightRadius: 8,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      shapeStyles.shapeLabel,
                      { color: isSelected ? colors.accent : colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
});

const shapeStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    borderRadius: 28,
    width: '100%',
    maxWidth: 360,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: {
    paddingVertical: 8,
  },
  shapeItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  shapePreview: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: 4,
  },
  shapeLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
});
