import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

import { useTheme } from '@/hooks/use-app-theme';
import { AppIcon } from '@/components/app-icon';
import type { AppInfo } from '@/hooks/use-installed-apps';

interface FavoriteTagItem {
  id: number;
  name: string;
  count: number;
}

interface SearchFavoritesProps {
  favorites: AppInfo[];
  tags: FavoriteTagItem[];
  selectedTag: number | 'all';
  onSelectTag: (tagId: number | 'all') => void;
  expanded: boolean;
  onToggleExpanded: () => void;
  columns: number;
  iconSize: number;
  showLabels: boolean;
  onAppPress: (app: AppInfo) => void;
  onAppLongPress: (app: AppInfo) => void;
}

const COLLAPSED_LIMIT = 8;

export function SearchFavorites({
  favorites,
  tags,
  selectedTag,
  onSelectTag,
  expanded,
  onToggleExpanded,
  columns,
  iconSize,
  showLabels,
  onAppPress,
  onAppLongPress,
}: SearchFavoritesProps) {
  const { colors } = useTheme();

  if (favorites.length === 0) return null;

  const visibleFavorites = expanded ? favorites : favorites.slice(0, COLLAPSED_LIMIT);
  const canExpand = favorites.length > COLLAPSED_LIMIT;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: colors.textSecondary }]}>Favorites</Text>
        {canExpand ? (
          <Pressable onPress={onToggleExpanded}>
            <Text style={[styles.expandLabel, { color: colors.accent }]}>
              {expanded ? 'Show less' : `Show all (${favorites.length})`}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {tags.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsRow}
          keyboardShouldPersistTaps="always"
        >
          <TagChip
            label={`All (${favorites.length})`}
            selected={selectedTag === 'all'}
            onPress={() => onSelectTag('all')}
          />
          {tags.map((tag) => (
            <TagChip
              key={tag.id}
              label={`${tag.name} (${tag.count})`}
              selected={selectedTag === tag.id}
              onPress={() => onSelectTag(tag.id)}
            />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.grid}>
        {visibleFavorites.map((app) => (
          <View key={app.packageName} style={{ width: `${100 / columns}%` }}>
            <AppIcon
              app={app}
              size={iconSize}
              showLabel={showLabels}
              onPress={() => onAppPress(app)}
              onLongPress={() => onAppLongPress(app)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

interface TagChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function TagChip({ label, selected, onPress }: TagChipProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tagChip,
        {
          borderColor: selected ? colors.accent : colors.border,
          backgroundColor: selected ? colors.accent : colors.surface,
        },
      ]}
    >
      <Text style={[styles.tagChipLabel, { color: selected ? '#fff' : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  header: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  expandLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsRow: {
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  tagChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagChipLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
