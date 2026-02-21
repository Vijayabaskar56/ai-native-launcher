import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDatabase } from '@/db';
import { favorites } from '@/db/schema/favorites';
import { searchables } from '@/db/schema/searchables';
import { eq, asc } from 'drizzle-orm';
import LauncherKit from '@/modules/launcher-kit/src';
import { parseWidgetConfig } from '@/core/types/widget-types';
import type { FavoritesWidgetConfig } from '@/core/types/widget-types';
import type { Widget } from '@/db/schema/widgets';

interface FavoriteApp {
  key: string;
  label: string;
  icon: string;
  packageName: string;
}

interface FavoritesWidgetProps {
  widget: Widget;
}

export function FavoritesWidget({ widget }: FavoritesWidgetProps) {
  const { colors } = useTheme();
  const { db } = useDatabase();
  const [apps, setApps] = useState<FavoriteApp[]>([]);
  const config = parseWidgetConfig<FavoritesWidgetConfig>(widget.config);
  const columns = config?.columns ?? 4;

  useEffect(() => {
    if (!db) return;

    async function loadFavorites() {
      try {
        const rows = await db!
          .select({
            key: favorites.searchableKey,
            data: searchables.data,
          })
          .from(favorites)
          .innerJoin(searchables, eq(favorites.searchableKey, searchables.key))
          .orderBy(asc(favorites.position));

        const parsed: FavoriteApp[] = rows.map((row) => {
          try {
            const appData = JSON.parse(row.data);
            return {
              key: row.key,
              label: appData.label || '',
              icon: appData.icon || '',
              packageName: appData.packageName || '',
            };
          } catch {
            return { key: row.key, label: '', icon: '', packageName: '' };
          }
        }).filter((a) => a.packageName);

        setApps(parsed);
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    }

    loadFavorites();
  }, [db]);

  const handleLaunch = (packageName: string) => {
    LauncherKit.launchApp(packageName).catch(() => {});
  };

  if (apps.length === 0) {
    return (
      <View>
        <View style={styles.header}>
          <MaterialCommunityIcons name="star-outline" size={24} color={colors.accent} />
          <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        </View>
        <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
          No favorite apps yet. Long-press an app to add it.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.header}>
        <MaterialCommunityIcons name="star-outline" size={20} color={colors.accent} />
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
      </View>
      <View style={[styles.grid, { gap: 12 }]}>
        {apps.map((app) => (
          <Pressable
            key={app.key}
            onPress={() => handleLaunch(app.packageName)}
            style={[styles.appItem, { width: `${Math.floor(100 / columns)}%` as any }]}
          >
            {app.icon ? (
              <Image
                source={{ uri: `data:image/png;base64,${app.icon}` }}
                style={styles.appIcon}
              />
            ) : (
              <View style={[styles.appIconPlaceholder, { backgroundColor: colors.surface }]}>
                <MaterialCommunityIcons name="apps" size={24} color={colors.textSecondary} />
              </View>
            )}
            <Text style={[styles.appLabel, { color: colors.text }]} numberOfLines={1}>
              {app.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  appItem: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  appIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 56,
  },
});
