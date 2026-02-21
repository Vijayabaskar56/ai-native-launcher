import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Keyboard, BackHandler, Pressable, Text } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/use-app-theme';
import { useSettings } from '@/hooks/use-settings';
import { useSearch } from '@/hooks/use-search';
import { registerScaffoldComponent } from '@/core/scaffold/component-registry';
import type { ScaffoldComponentProps } from '@/core/scaffold/types';
import type { AppInfo } from '@/hooks/use-installed-apps';
import LauncherKit, { type ShortcutInfo } from '@/modules/launcher-kit';
import { AppLongPressMenu } from '@/components/app-long-press-menu';

import { KeyboardFilterBar } from './keyboard-filter-bar';
import { SearchBar } from './search-bar';
import { SearchColumn } from './search-column';

const SEARCH_BAR_SPACE = 68;

function filtersModified(search: ReturnType<typeof useSearch>): boolean {
  return (
    search.filters.allowNetwork ||
    search.filters.hiddenItems ||
    !search.allCategoriesEnabled
  );
}

export function SearchComponent({ isActive, onRequestClose }: ScaffoldComponentProps) {
  const { colors } = useTheme();
  const { layout, grid, searchBehavior } = useSettings();
  const search = useSearch();
  const scrollProgress = useSharedValue(0);

  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [shortcuts, setShortcuts] = useState<ShortcutInfo[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (!isActive) {
      search.setQuery('');
      scrollProgress.value = 0;
      setFiltersVisible(false);
      setKeyboardVisible(false);
    }
  }, [isActive, scrollProgress, search]);

  useEffect(() => {
    setFiltersVisible(false);
  }, [search.query]);

  useEffect(() => {
    if (!isActive) return;

    const keyboardShow = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const keyboardHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardShow.remove();
      keyboardHide.remove();
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (search.query.length > 0) {
        search.setQuery('');
        return true;
      }

      onRequestClose();
      return true;
    });

    return () => sub.remove();
  }, [isActive, onRequestClose, search]);

  const handleAppPress = useCallback(
    async (app: AppInfo) => {
      await search.launchApp(app);
      Keyboard.dismiss();
      onRequestClose();
    },
    [onRequestClose, search],
  );

  const handleSearchShortcutPress = useCallback(
    async (shortcut: ReturnType<typeof useSearch>['results']['shortcuts'][number]) => {
      await search.launchShortcut(shortcut);
      onRequestClose();
    },
    [onRequestClose, search],
  );

  const handleSearchActionPress = useCallback(
    async (action: ReturnType<typeof useSearch>['results']['actions'][number]) => {
      await search.launchAction(action);
      onRequestClose();
    },
    [onRequestClose, search],
  );

  const handleAppLongPress = useCallback(async (app: AppInfo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedApp(app);
    setMenuVisible(true);
    try {
      const appShortcuts = await LauncherKit.getAppShortcuts(app.packageName);
      setShortcuts(appShortcuts);
    } catch {
      setShortcuts([]);
    }
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuVisible(false);
    setShortcuts([]);
  }, []);

  const handleMenuLaunch = useCallback(async () => {
    if (selectedApp) {
      await search.launchApp(selectedApp);
      Keyboard.dismiss();
      onRequestClose();
    }
  }, [onRequestClose, search, selectedApp]);

  const handleMenuAppInfo = useCallback(async () => {
    if (selectedApp) {
      await LauncherKit.openAppSettings(selectedApp.packageName);
    }
  }, [selectedApp]);

  const handleMenuUninstall = useCallback(async () => {
    if (selectedApp) {
      await LauncherKit.uninstallApp(selectedApp.packageName);
    }
  }, [selectedApp]);

  const handleMenuShortcutPress = useCallback(async (shortcut: ShortcutInfo) => {
    try {
      await LauncherKit.launchShortcut(shortcut.packageName, shortcut.id);
      Keyboard.dismiss();
      onRequestClose();
    } catch {
      // ignore
    }
  }, [onRequestClose]);

  const handleSubmit = useCallback(async () => {
    if (search.query.trim().length === 0 || !search.bestMatch) {
      return;
    }

    await search.launchBestMatchOrAction();
    onRequestClose();
  }, [onRequestClose, search]);

  const isSearchBarBottom = layout.searchBarBottom;
  const isSearchBarFixed = layout.searchBarFixed;
  const contentPaddingTop = isSearchBarBottom ? 8 : SEARCH_BAR_SPACE;
  const contentPaddingBottom = isSearchBarBottom ? SEARCH_BAR_SPACE : 8;

  const favoriteTagItems = search.favoriteTags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    count: tag.packageNames.size,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar
        query={search.query}
        onQueryChange={search.setQuery}
        style={layout.searchBarStyle}
        isBottom={isSearchBarBottom}
        fixed={isSearchBarFixed}
        scrollProgress={scrollProgress}
        autoFocus={isActive && searchBehavior.searchBarKeyboard && searchBehavior.searchBarAutoFocus}
        onSubmitEditing={handleSubmit}
        filtersActive={filtersModified(search)}
        onToggleFilters={() => setFiltersVisible((visible) => !visible)}
      />

      {filtersVisible ? (
        <View style={[styles.filtersPanel, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.filtersTitle, { color: colors.textSecondary }]}>Search filters</Text>
          <View style={styles.filtersRow}>
            <FilterToggle
              label="Online results"
              enabled={search.filters.allowNetwork}
              onPress={() => search.toggleFilter('allowNetwork')}
            />
            <FilterToggle
              label="Hidden items"
              enabled={search.filters.hiddenItems}
              onPress={() => search.toggleFilter('hiddenItems')}
            />
            <Pressable onPress={() => search.setQuery('')}>
              <Text style={[styles.resetText, { color: colors.accent }]}>Reset query</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <KeyboardFilterBar
        filters={search.filters}
        onToggleFilter={search.toggleFilter}
        visible={isActive && keyboardVisible && searchBehavior.filterBar}
      />

      <SearchColumn
        query={search.query}
        allApps={search.allApps}
        favoriteApps={search.favoriteApps}
        favoriteTags={favoriteTagItems}
        selectedFavoriteTag={search.selectedFavoriteTag}
        onSelectFavoriteTag={search.setSelectedFavoriteTag}
        favoritesExpanded={search.favoritesExpanded}
        onToggleFavoritesExpanded={() => search.setFavoritesExpanded(!search.favoritesExpanded)}
        results={search.results}
        columns={grid.gridColumnCount}
        iconSize={grid.gridIconSize}
        showLabels={grid.gridLabels}
        onAppPress={handleAppPress}
        onAppLongPress={handleAppLongPress}
        onShortcutPress={handleSearchShortcutPress}
        onActionPress={handleSearchActionPress}
        scrollProgress={scrollProgress}
        contentPaddingTop={contentPaddingTop}
        contentPaddingBottom={contentPaddingBottom}
      />

      <AppLongPressMenu
        visible={menuVisible}
        app={selectedApp}
        onClose={handleMenuClose}
        onLaunch={handleMenuLaunch}
        onAppInfo={handleMenuAppInfo}
        onUninstall={handleMenuUninstall}
        isFavorite={search.isFavorite(selectedApp?.packageName || '')}
        onToggleFavorite={() => selectedApp && search.toggleFavorite(selectedApp.packageName)}
        shortcuts={shortcuts}
        onShortcutPress={handleMenuShortcutPress}
      />
    </View>
  );
}

interface FilterToggleProps {
  label: string;
  enabled: boolean;
  onPress: () => void;
}

function FilterToggle({ label, enabled, onPress }: FilterToggleProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterToggle,
        {
          borderColor: enabled ? colors.accent : colors.border,
          backgroundColor: enabled ? colors.accent : colors.surface,
        },
      ]}
    >
      <Text style={[styles.filterToggleLabel, { color: enabled ? '#fff' : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

registerScaffoldComponent({
  id: 'search',
  component: SearchComponent,
  label: 'Search',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersPanel: {
    marginHorizontal: 16,
    marginTop: 70,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    zIndex: 12,
  },
  filtersTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterToggle: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterToggleLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  resetText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
});
