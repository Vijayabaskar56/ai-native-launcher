import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '@/db';
import { favorites, searchables } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { AppInfo } from './use-installed-apps';

interface UseFavoritesReturn {
  favorites: string[];
  isFavorite: (packageName: string) => boolean;
  addFavorite: (packageName: string) => Promise<void>;
  removeFavorite: (packageName: string) => Promise<void>;
  toggleFavorite: (packageName: string) => Promise<void>;
  loading: boolean;
}

export function useFavorites(): UseFavoritesReturn {
  const { db, isLoading: dbLoading } = useDatabase();
  const [favoritesList, setFavoritesList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!db || dbLoading) return;

    try {
      const rows = await db
        .select({ key: searchables.key })
        .from(favorites)
        .innerJoin(searchables, eq(favorites.searchableKey, searchables.key))
        .orderBy(desc(favorites.position));
      
      setFavoritesList(rows.map(r => r.key));
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [db, dbLoading]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (packageName: string) => favoritesList.includes(packageName),
    [favoritesList]
  );

  const addFavorite = useCallback(async (packageName: string) => {
    if (!db) return;

    if (favoritesList.includes(packageName)) return;

    try {
      await db.transaction(async (tx) => {
        await tx.insert(searchables).values({
          key: packageName,
          type: 'app',
          data: JSON.stringify({ packageName }),
        }).onConflictDoNothing();

        const maxPos = await tx.select({ position: favorites.position })
          .from(favorites)
          .orderBy(desc(favorites.position))
          .limit(1);
        
        const nextPosition = (maxPos[0]?.position ?? -1) + 1;

        await tx.insert(favorites).values({
          searchableKey: packageName,
          position: nextPosition,
          createdAt: new Date(),
        });
      });

      setFavoritesList(prev => [...prev, packageName]);
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  }, [db, favoritesList]);

  const removeFavorite = useCallback(async (packageName: string) => {
    if (!db) return;

    try {
      await db.delete(favorites).where(eq(favorites.searchableKey, packageName));
      setFavoritesList(prev => prev.filter(p => p !== packageName));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  }, [db]);

  const toggleFavorite = useCallback(async (packageName: string) => {
    if (isFavorite(packageName)) {
      await removeFavorite(packageName);
    } else {
      await addFavorite(packageName);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites: favoritesList,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loading: loading || dbLoading,
  };
}

export async function migrateFavoritesFromAsyncStorage(
  db: NonNullable<ReturnType<typeof useDatabase>['db']>
): Promise<void> {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const FAVORITES_STORAGE_KEY = '@launcher_favorites';

  try {
    const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return;

    const packageNames: string[] = JSON.parse(stored);
    if (!Array.isArray(packageNames) || packageNames.length === 0) return;

    for (let i = 0; i < packageNames.length; i++) {
      const packageName = packageNames[i];
      
      await db.transaction(async (tx) => {
        await tx.insert(searchables).values({
          key: packageName,
          type: 'app',
          data: JSON.stringify({ packageName }),
        }).onConflictDoNothing();

        await tx.insert(favorites).values({
          searchableKey: packageName,
          position: i,
          createdAt: new Date(),
        }).onConflictDoNothing();
      });
    }

    await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
    console.log('Migrated favorites from AsyncStorage to SQLite');
  } catch (error) {
    console.error('Failed to migrate favorites:', error);
  }
}
