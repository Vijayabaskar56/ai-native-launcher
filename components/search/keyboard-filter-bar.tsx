import { ScrollView, Pressable, Text, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-app-theme';
import type { SearchFiltersState } from '@/core/types/settings';

import type { SearchFilterKey } from '@/hooks/use-search';

interface FilterItem {
  key: SearchFilterKey;
  label: string;
  category: boolean;
}

const FILTERS: FilterItem[] = [
  { key: 'allowNetwork', label: 'Online', category: false },
  { key: 'apps', label: 'Apps', category: true },
  { key: 'shortcuts', label: 'Shortcuts', category: true },
  { key: 'events', label: 'Calendar', category: true },
  { key: 'contacts', label: 'Contacts', category: true },
  { key: 'files', label: 'Files', category: true },
  { key: 'tools', label: 'Tools', category: true },
  { key: 'articles', label: 'Articles', category: true },
  { key: 'websites', label: 'Websites', category: true },
  { key: 'places', label: 'Places', category: true },
  { key: 'hiddenItems', label: 'Hidden', category: false },
];

interface KeyboardFilterBarProps {
  filters: SearchFiltersState;
  onToggleFilter: (filter: SearchFilterKey) => void;
  visible: boolean;
}

function allCategoriesEnabled(filters: SearchFiltersState): boolean {
  return (
    filters.apps &&
    filters.shortcuts &&
    filters.contacts &&
    filters.events &&
    filters.files &&
    filters.tools &&
    filters.websites &&
    filters.articles &&
    filters.places
  );
}

function isSelected(item: FilterItem, filters: SearchFiltersState): boolean {
  if (item.key === 'allowNetwork') return filters.allowNetwork;
  if (item.key === 'hiddenItems') return filters.hiddenItems;

  if (item.category && allCategoriesEnabled(filters)) return false;

  return filters[item.key];
}

export function KeyboardFilterBar({ filters, onToggleFilter, visible }: KeyboardFilterBarProps) {
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View style={[styles.wrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="always"
      >
        {FILTERS.map((item) => {
          const selected = isSelected(item, filters);

          return (
            <Pressable
              key={item.key}
              onPress={() => onToggleFilter(item.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.accent : colors.surface,
                  borderColor: selected ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: selected ? '#fff' : colors.text }]}> 
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
