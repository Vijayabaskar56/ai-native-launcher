import { useState, useEffect } from 'react';
import { Alert, Modal, StyleSheet, View, Pressable, Text, ScrollView, TextInput, Platform } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWidgets } from '@/hooks/use-widgets';
import { BUILT_IN_WIDGETS } from '@/core/types/widget-types';
import type { WidgetType } from '@/core/types/widget-types';
import LauncherKit, { type WidgetProviderInfo } from '@/modules/launcher-kit/src';

interface WidgetPickerProps {
  visible: boolean;
  onClose: () => void;
}

export function WidgetPicker({ visible, onClose }: WidgetPickerProps) {
  const { colors } = useTheme();
  const { addWidget } = useWidgets();
  const [searchQuery, setSearchQuery] = useState('');
  const [appWidgetProviders, setAppWidgetProviders] = useState<WidgetProviderInfo[]>([]);

  useEffect(() => {
    if (visible && Platform.OS === 'android') {
      LauncherKit.getInstalledWidgetProviders()
        .then(setAppWidgetProviders)
        .catch(() => setAppWidgetProviders([]));
    }
  }, [visible]);

  const handleAddBuiltIn = async (type: WidgetType, defaultConfig: string, defaultSizing: string) => {
    await addWidget({
      type,
      config: defaultConfig,
      sizing: defaultSizing as 'border' | 'full',
    });
    onClose();
  };

  const handleAddAppWidget = async (provider: WidgetProviderInfo) => {
    try {
      const appWidgetId = await LauncherKit.allocateAndBindWidget(provider.provider);
      if (typeof appWidgetId !== 'number' || appWidgetId < 0) {
        throw new Error('Invalid widget id returned from native host');
      }
      await addWidget({
        type: 'appwidget',
        config: JSON.stringify({
          packageName: provider.packageName,
          className: provider.className,
          label: provider.label,
          minWidth: provider.minWidth,
          minHeight: provider.minHeight,
        }),
        sizing: 'full',
        appWidgetId,
      });
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('cancelled') || msg.includes('denied')) {
        // User intentionally cancelled — just close the picker
        onClose();
      } else {
        Alert.alert('Widget Error', 'Failed to add widget. Please try again.');
      }
    }
  };

  const query = searchQuery.toLowerCase();
  const filteredBuiltIn = BUILT_IN_WIDGETS.filter(
    (w) => w.label.toLowerCase().includes(query) || w.description.toLowerCase().includes(query)
  );
  const filteredAppWidgets = appWidgetProviders.filter(
    (p) => p.label.toLowerCase().includes(query) || p.packageName.toLowerCase().includes(query)
  );

  // Group app widgets by package
  const groupedAppWidgets = new Map<string, WidgetProviderInfo[]>();
  for (const p of filteredAppWidgets) {
    const list = groupedAppWidgets.get(p.packageName) ?? [];
    list.push(p);
    groupedAppWidgets.set(p.packageName, list);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Add Widget</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Search bar */}
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search widgets..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {/* Built-in widgets */}
            {filteredBuiltIn.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Built-in Widgets</Text>
                {filteredBuiltIn.map((def) => (
                  <Pressable
                    key={def.type}
                    onPress={() => handleAddBuiltIn(def.type, def.defaultConfig, def.defaultSizing)}
                    style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <MaterialCommunityIcons
                      name={def.icon as any}
                      size={28}
                      color={colors.accent}
                    />
                    <View style={styles.itemText}>
                      <Text style={[styles.itemLabel, { color: colors.text }]}>{def.label}</Text>
                      <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>{def.description}</Text>
                    </View>
                    <MaterialCommunityIcons name="plus-circle-outline" size={24} color={colors.accent} />
                  </Pressable>
                ))}
              </>
            )}

            {/* App widgets */}
            {groupedAppWidgets.size > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 8 }]}>
                  App Widgets
                </Text>
                {Array.from(groupedAppWidgets.entries()).map(([pkg, providers]) => (
                  <View key={pkg}>
                    {providers.map((provider) => (
                      <Pressable
                        key={provider.provider}
                        onPress={() => handleAddAppWidget(provider)}
                        style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      >
                        <MaterialCommunityIcons name="widgets-outline" size={28} color={colors.textSecondary} />
                        <View style={styles.itemText}>
                          <Text style={[styles.itemLabel, { color: colors.text }]}>{provider.label}</Text>
                          <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>
                            {provider.packageName.split('.').pop()}
                          </Text>
                        </View>
                        <MaterialCommunityIcons name="plus-circle-outline" size={24} color={colors.accent} />
                      </Pressable>
                    ))}
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  list: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: 4,
    paddingTop: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  itemText: {
    flex: 1,
    gap: 2,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDesc: {
    fontSize: 13,
  },
});
