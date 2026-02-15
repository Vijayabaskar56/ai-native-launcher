import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = '@launcher_favorites';

interface UseFavoritesReturn {
  favorites: string[];
  isFavorite: (packageName: string) => boolean;
  addFavorite: (packageName: string) => Promise<void>;
  removeFavorite: (packageName: string) => Promise<void>;
  toggleFavorite: (packageName: string) => Promise<void>;
  loading: boolean;
}

export function useFavorites(): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveFavorites = useCallback(async (favs: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favs));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  useEffect(() => {
    if (!loading) {
      saveFavorites(favorites);
    }
  }, [favorites, loading, saveFavorites]);

  const isFavorite = useCallback(
    (packageName: string) => favorites.includes(packageName),
    [favorites]
  );

  const addFavorite = useCallback(async (packageName: string) => {
    setFavorites((prev) => {
      if (prev.includes(packageName)) return prev;
      return [...prev, packageName];
    });
  }, []);

  const removeFavorite = useCallback(async (packageName: string) => {
    setFavorites((prev) => prev.filter((p) => p !== packageName));
  }, []);

  const toggleFavorite = useCallback(async (packageName: string) => {
    setFavorites((prev) => {
      if (prev.includes(packageName)) {
        return prev.filter((p) => p !== packageName);
      }
      return [...prev, packageName];
    });
  }, []);

  return {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loading,
  };
}
