import { useCallback } from 'react';
import { ScrollView, StyleSheet, View, Text, Keyboard, Pressable, Image } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-app-theme';
import type { AppInfo } from '@/hooks/use-installed-apps';
import type { ActionSearchResult, SearchResults, ShortcutSearchResult } from '@/hooks/use-search';

import { AppResults } from './app-results';
import { SearchFavorites } from './search-favorites';

interface TagItem {
  id: number;
  name: string;
  count: number;
}

interface SearchColumnProps {
  query: string;
  allApps: AppInfo[];
  favoriteApps: AppInfo[];
  favoriteTags: TagItem[];
  selectedFavoriteTag: number | 'all';
  onSelectFavoriteTag: (tagId: number | 'all') => void;
  favoritesExpanded: boolean;
  onToggleFavoritesExpanded: () => void;
  results: SearchResults;
  columns: number;
  iconSize: number;
  showLabels: boolean;
  onAppPress: (app: AppInfo) => void;
  onAppLongPress: (app: AppInfo) => void;
  onShortcutPress: (shortcut: ShortcutSearchResult) => void;
  onActionPress: (action: ActionSearchResult) => void;
  scrollProgress: SharedValue<number>;
  contentPaddingTop: number;
  contentPaddingBottom: number;
}

export function SearchColumn({
  query,
  allApps,
  favoriteApps,
  favoriteTags,
  selectedFavoriteTag,
  onSelectFavoriteTag,
  favoritesExpanded,
  onToggleFavoritesExpanded,
  results,
  columns,
  iconSize,
  showLabels,
  onAppPress,
  onAppLongPress,
  onShortcutPress,
  onActionPress,
  scrollProgress,
  contentPaddingTop,
  contentPaddingBottom,
}: SearchColumnProps) {
  const { colors } = useTheme();

  const handleScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = event.nativeEvent.contentOffset.y;
      scrollProgress.value = Math.min(1, Math.max(0, y / 100));
    },
    [scrollProgress],
  );

  const hasQuery = query.trim().length > 0;
  const hasAnyResults =
    results.apps.length > 0 ||
    results.shortcuts.length > 0 ||
    results.contacts.length > 0 ||
    results.calendar.length > 0 ||
    results.files.length > 0 ||
    results.tools.length > 0 ||
    results.websites.length > 0 ||
    results.articles.length > 0 ||
    results.places.length > 0 ||
    results.actions.length > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: contentPaddingTop,
        paddingBottom: contentPaddingBottom,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onScrollBeginDrag={() => Keyboard.dismiss()}
    >
      {!hasQuery ? (
        <View>
          <SearchFavorites
            favorites={favoriteApps}
            tags={favoriteTags}
            selectedTag={selectedFavoriteTag}
            onSelectTag={onSelectFavoriteTag}
            expanded={favoritesExpanded}
            onToggleExpanded={onToggleFavoritesExpanded}
            columns={columns}
            iconSize={iconSize}
            showLabels={showLabels}
            onAppPress={onAppPress}
            onAppLongPress={onAppLongPress}
          />
          <AppResults
            apps={allApps}
            columns={columns}
            iconSize={iconSize}
            showLabels={showLabels}
            onAppPress={onAppPress}
            onAppLongPress={onAppLongPress}
          />
        </View>
      ) : (
        <View>
          <AppResults
            apps={results.apps}
            columns={columns}
            iconSize={iconSize}
            showLabels={showLabels}
            onAppPress={onAppPress}
            onAppLongPress={onAppLongPress}
          />

          <ShortcutSection shortcuts={results.shortcuts} onPress={onShortcutPress} />

          <ActionSection title="Contacts" actions={results.contacts} onPress={onActionPress} />
          <ActionSection title="Calendar" actions={results.calendar} onPress={onActionPress} />
          <ActionSection title="Files" actions={results.files} onPress={onActionPress} />
          <ActionSection title="Tools" actions={results.tools} onPress={onActionPress} />
          <ActionSection title="Websites" actions={results.websites} onPress={onActionPress} />
          <ActionSection title="Articles" actions={results.articles} onPress={onActionPress} />
          <ActionSection title="Places" actions={results.places} onPress={onActionPress} />
          <ActionSection title="Actions" actions={results.actions} onPress={onActionPress} />

          {!hasAnyResults ? (
            <Text style={[styles.empty, { color: colors.textSecondary }]}>No results found</Text>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}

interface ShortcutSectionProps {
  shortcuts: ShortcutSearchResult[];
  onPress: (shortcut: ShortcutSearchResult) => void;
}

function ShortcutSection({ shortcuts, onPress }: ShortcutSectionProps) {
  const { colors } = useTheme();

  if (shortcuts.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>Shortcuts</Text>
      {shortcuts.map((result) => (
        <Pressable
          key={result.key}
          style={styles.row}
          onPress={() => onPress(result)}
          android_ripple={{ color: colors.border }}
        >
          {result.shortcut.icon ? (
            <Image
              source={{ uri: `data:image/png;base64,${result.shortcut.icon}` }}
              style={styles.rowIcon}
            />
          ) : (
            <View style={[styles.rowIcon, { backgroundColor: colors.border }]} />
          )}
          <View style={styles.rowLabelWrap}>
            <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
              {result.shortcut.shortLabel || result.shortcut.longLabel}
            </Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {result.appLabel}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

interface ActionSectionProps {
  title: string;
  actions: ActionSearchResult[];
  onPress: (action: ActionSearchResult) => void;
}

function ActionSection({ title, actions, onPress }: ActionSectionProps) {
  const { colors } = useTheme();

  if (actions.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{title}</Text>
      {actions.map((action) => (
        <Pressable
          key={action.id}
          style={styles.row}
          onPress={() => onPress(action)}
          android_ripple={{ color: colors.border }}
        >
          <View style={[styles.actionDot, { backgroundColor: colors.accent }]} />
          <View style={styles.rowLabelWrap}>
            <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
              {action.title}
            </Text>
            {action.subtitle ? (
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {action.subtitle}
              </Text>
            ) : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  rowIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginRight: 8,
  },
  rowLabelWrap: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
