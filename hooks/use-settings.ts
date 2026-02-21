import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsService } from '@/services/settings-service';
import type { AppSettings } from '@/core/types/settings';

let initialized = false;

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(settingsService.getSettings());
  const [isLoaded, setIsLoaded] = useState(initialized);

  useEffect(() => {
    if (!initialized) {
      settingsService.init(AsyncStorage).then(() => {
        setSettings(settingsService.getSettings());
        setIsLoaded(true);
        initialized = true;
      });
    }

    const unsubscribe = settingsService.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  const updateSettings = useCallback(
    async <K extends keyof AppSettings>(category: K, updates: Partial<AppSettings[K]>) => {
      await settingsService.updateSettings(category, updates);
    },
    []
  );

  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(category: K, key: string, value: unknown) => {
      await settingsService.updateSetting(category, key, value);
    },
    []
  );

  const resetSettings = useCallback(async () => {
    await settingsService.reset();
  }, []);

  return {
    settings,
    isLoaded,
    updateSettings,
    updateSetting,
    resetSettings,
    ui: settings.ui,
    layout: settings.layout,
    grid: settings.grid,
    icons: settings.icons,
    badges: settings.badges,
    gestures: settings.gestures,
    locale: settings.locale,
    searchSources: settings.searchSources,
    searchBehavior: settings.searchBehavior,
    integrations: settings.integrations,
  };
}