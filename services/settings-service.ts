import { AppSettings, DEFAULT_SETTINGS } from '@/core/types/settings';

const SETTINGS_KEY = '@claw_launcher_settings';

class SettingsService {
  private settings: AppSettings = DEFAULT_SETTINGS;
  private listeners: Set<(settings: AppSettings) => void> = new Set();
  private storage: AsyncStorage | null = null;

  async init(storage: AsyncStorage): Promise<void> {
    this.storage = storage;
    try {
      const stored = await this.storage.getItem(SETTINGS_KEY);
      if (stored) {
        this.settings = this.mergeSettings(DEFAULT_SETTINGS, JSON.parse(stored));
        this.migrateGestures();
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private migrateGestures(): void {
    // Migrate from pre-parity defaults to Kvaesitso defaults.
    const g = this.settings.gestures;
    if (g.gesturesSwipeUp === 'Search' && g.gesturesLongPress === 'Widgets') {
      g.gesturesSwipeUp = 'Widgets';
      g.gesturesLongPress = 'Search';
    }

    // Legacy default set Search on long-press/home and Notifications on swipe-down.
    if (
      g.gesturesSwipeDown === 'Notifications' &&
      g.gesturesSwipeUp === 'Widgets' &&
      g.gesturesLongPress === 'Search' &&
      g.gesturesHomeButton === 'Search'
    ) {
      g.gesturesSwipeDown = 'Search';
      g.gesturesLongPress = 'NoAction';
      g.gesturesHomeButton = 'NoAction';
    }

    this.save();
  }

  private mergeSettings(defaults: AppSettings, stored: Partial<AppSettings>): AppSettings {
    return {
      ui: { ...defaults.ui, ...stored.ui },
      layout: { ...defaults.layout, ...stored.layout },
      grid: { ...defaults.grid, ...stored.grid },
      icons: { ...defaults.icons, ...stored.icons },
      badges: { ...defaults.badges, ...stored.badges },
      gestures: { ...defaults.gestures, ...stored.gestures },
      locale: { ...defaults.locale, ...stored.locale },
      searchSources: { ...defaults.searchSources, ...stored.searchSources },
      searchBehavior: { ...defaults.searchBehavior, ...stored.searchBehavior },
      integrations: { ...defaults.integrations, ...stored.integrations },
    };
  }

  getSettings(): AppSettings {
    return this.settings;
  }

  async updateSettings<K extends keyof AppSettings>(
    category: K,
    updates: Partial<AppSettings[K]>
  ): Promise<void> {
    this.settings = {
      ...this.settings,
      [category]: { ...this.settings[category], ...updates },
    };
    await this.save();
    this.notifyListeners();
  }

  async updateSetting<K extends keyof AppSettings>(
    category: K,
    key: string,
    value: unknown
  ): Promise<void> {
    this.settings[category] = { ...this.settings[category], [key]: value } as AppSettings[K];
    await this.save();
    this.notifyListeners();
  }

  private async save(): Promise<void> {
    if (!this.storage) return;
    try {
      await this.storage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  subscribe(listener: (settings: AppSettings) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.settings));
  }

  async reset(): Promise<void> {
    this.settings = DEFAULT_SETTINGS;
    await this.save();
    this.notifyListeners();
  }

  async exportSettings(): Promise<string> {
    return JSON.stringify(this.settings, null, 2);
  }

  async importSettings(json: string): Promise<boolean> {
    try {
      const imported = JSON.parse(json);
      this.settings = this.mergeSettings(DEFAULT_SETTINGS, imported);
      await this.save();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }
}

interface AsyncStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export const settingsService = new SettingsService();
