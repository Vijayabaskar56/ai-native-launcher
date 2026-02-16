import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from './provider';
import { settings } from './schema';

export type ColorScheme = 'Light' | 'Dark' | 'System';
export type ClockWidgetStyle = 'Digital1' | 'Digital2' | 'Orbit' | 'Analog' | 'Binary' | 'Segment' | 'Empty' | 'Custom';
export type ClockWidgetColors = 'Auto' | 'Light' | 'Dark';
export type ClockWidgetAlignment = 'Top' | 'Center' | 'Bottom';
export type SearchBarStyle = 'Transparent' | 'Solid' | 'Hidden';
export type SearchBarColors = 'Auto' | 'Light' | 'Dark';
export type IconShape = 'PlatformDefault' | 'Circle' | 'Square' | 'RoundedSquare' | 'Triangle' | 'Squircle' | 'Hexagon' | 'Pentagon' | 'Teardrop' | 'Pebble';
export type SystemBarColors = 'Auto' | 'Light' | 'Dark';
export type ScreenOrientation = 'Auto' | 'Portrait' | 'Landscape';
export type BaseLayout = 'PullDown' | 'Pager' | 'PagerReversed';
export type SurfaceShape = 'Rounded' | 'Cut';
export type WeightFactor = 'Default' | 'Low' | 'High';
export type TimeFormat = 'System' | 'TwelveHour' | 'TwentyFourHour';
export type MeasurementSystem = 'System' | 'Metric' | 'UnitedKingdom' | 'UnitedStates';
export type GestureActionType = 
  | 'NoAction' 
  | 'Notifications' 
  | 'QuickSettings' 
  | 'ScreenLock' 
  | 'Search' 
  | 'Widgets' 
  | 'PowerMenu' 
  | 'Recents' 
  | 'Feed';

export interface LauncherSettings {
  schemaVersion: number;
  
  uiColorScheme: ColorScheme;
  uiColorsId: string;
  uiShapesId: string;
  uiTransparenciesId: string;
  uiTypographyId: string;
  uiCompatModeColors: boolean;
  uiOrientation: ScreenOrientation;
  
  wallpaperDim: boolean;
  wallpaperBlur: boolean;
  wallpaperBlurRadius: number;
  
  clockWidgetCompact: boolean;
  clockWidgetStyle: ClockWidgetStyle;
  clockWidgetColors: ClockWidgetColors;
  clockWidgetShowSeconds: boolean;
  clockWidgetMonospaced: boolean;
  clockWidgetUseThemeColor: boolean;
  clockWidgetAlarmPart: boolean;
  clockWidgetBatteryPart: boolean;
  clockWidgetMusicPart: boolean;
  clockWidgetDatePart: boolean;
  clockWidgetFillHeight: boolean;
  clockWidgetAlignment: ClockWidgetAlignment;
  
  homeScreenDock: boolean;
  homeScreenDockRows: number;
  homeScreenWidgets: boolean;
  
  favoritesEnabled: boolean;
  favoritesFrequentlyUsed: boolean;
  favoritesFrequentlyUsedRows: number;
  favoritesEditButton: boolean;
  favoritesCompactTags: boolean;
  
  searchAllApps: boolean;
  searchBarStyle: SearchBarStyle;
  searchBarColors: SearchBarColors;
  searchBarKeyboard: boolean;
  searchLaunchOnEnter: boolean;
  searchBarBottom: boolean;
  searchBarFixed: boolean;
  searchResultsReversed: boolean;
  
  gridColumnCount: number;
  gridIconSize: number;
  gridLabels: boolean;
  gridList: boolean;
  gridListIcons: boolean;
  
  iconsShape: IconShape;
  iconsAdaptify: boolean;
  iconsThemed: boolean;
  iconsForceThemed: boolean;
  iconsPack: string | null;
  
  badgesNotifications: boolean;
  badgesSuspendedApps: boolean;
  badgesCloudFiles: boolean;
  badgesShortcuts: boolean;
  badgesPlugins: boolean;
  
  systemBarsHideStatus: boolean;
  systemBarsHideNav: boolean;
  systemBarsStatusColors: SystemBarColors;
  systemBarsNavColors: SystemBarColors;
  
  surfacesOpacity: number;
  surfacesRadius: number;
  surfacesBorderWidth: number;
  surfacesShape: SurfaceShape;
  
  gesturesSwipeDown: GestureActionType;
  gesturesSwipeLeft: GestureActionType;
  gesturesSwipeRight: GestureActionType;
  gesturesSwipeUp: GestureActionType;
  gesturesDoubleTap: GestureActionType;
  gesturesLongPress: GestureActionType;
  gesturesHomeButton: GestureActionType;
  
  rankingWeightFactor: WeightFactor;
  hiddenItemsShowButton: boolean;
  
  contactSearchEnabled: boolean;
  calendarSearchEnabled: boolean;
  shortcutSearchEnabled: boolean;
  calculatorEnabled: boolean;
  unitConverterEnabled: boolean;
  unitConverterCurrencies: boolean;
  wikipediaSearchEnabled: boolean;
  websiteSearchEnabled: boolean;
  
  weatherProvider: string;
  weatherAutoLocation: boolean;
  
  animationsCharging: boolean;
  
  localeTimeFormat: TimeFormat;
  localeMeasurementSystem: MeasurementSystem;
  
  easterEgg: boolean;
  separateWorkProfile: boolean;
}

const defaultSettings: LauncherSettings = {
  schemaVersion: 1,
  
  uiColorScheme: 'System',
  uiColorsId: '00000000-0000-0000-0000-000000000000',
  uiShapesId: '00000000-0000-0000-0000-000000000000',
  uiTransparenciesId: '00000000-0000-0000-0000-000000000000',
  uiTypographyId: '00000000-0000-0000-0000-000000000000',
  uiCompatModeColors: false,
  uiOrientation: 'Auto',
  
  wallpaperDim: false,
  wallpaperBlur: true,
  wallpaperBlurRadius: 32,
  
  clockWidgetCompact: false,
  clockWidgetStyle: 'Digital1',
  clockWidgetColors: 'Auto',
  clockWidgetShowSeconds: false,
  clockWidgetMonospaced: false,
  clockWidgetUseThemeColor: false,
  clockWidgetAlarmPart: true,
  clockWidgetBatteryPart: true,
  clockWidgetMusicPart: true,
  clockWidgetDatePart: true,
  clockWidgetFillHeight: false,
  clockWidgetAlignment: 'Bottom',
  
  homeScreenDock: false,
  homeScreenDockRows: 1,
  homeScreenWidgets: false,
  
  favoritesEnabled: true,
  favoritesFrequentlyUsed: true,
  favoritesFrequentlyUsedRows: 1,
  favoritesEditButton: true,
  favoritesCompactTags: false,
  
  searchAllApps: true,
  searchBarStyle: 'Transparent',
  searchBarColors: 'Auto',
  searchBarKeyboard: true,
  searchLaunchOnEnter: true,
  searchBarBottom: false,
  searchBarFixed: false,
  searchResultsReversed: false,
  
  gridColumnCount: 5,
  gridIconSize: 48,
  gridLabels: true,
  gridList: false,
  gridListIcons: true,
  
  iconsShape: 'PlatformDefault',
  iconsAdaptify: false,
  iconsThemed: false,
  iconsForceThemed: false,
  iconsPack: null,
  
  badgesNotifications: true,
  badgesSuspendedApps: true,
  badgesCloudFiles: true,
  badgesShortcuts: true,
  badgesPlugins: true,
  
  systemBarsHideStatus: false,
  systemBarsHideNav: false,
  systemBarsStatusColors: 'Auto',
  systemBarsNavColors: 'Auto',
  
  surfacesOpacity: 1,
  surfacesRadius: 24,
  surfacesBorderWidth: 0,
  surfacesShape: 'Rounded',
  
  gesturesSwipeDown: 'Search',
  gesturesSwipeLeft: 'NoAction',
  gesturesSwipeRight: 'NoAction',
  gesturesSwipeUp: 'Widgets',
  gesturesDoubleTap: 'ScreenLock',
  gesturesLongPress: 'NoAction',
  gesturesHomeButton: 'NoAction',
  
  rankingWeightFactor: 'Default',
  hiddenItemsShowButton: false,
  
  contactSearchEnabled: true,
  calendarSearchEnabled: true,
  shortcutSearchEnabled: true,
  calculatorEnabled: true,
  unitConverterEnabled: true,
  unitConverterCurrencies: true,
  wikipediaSearchEnabled: true,
  websiteSearchEnabled: true,
  
  weatherProvider: 'metno',
  weatherAutoLocation: true,
  
  animationsCharging: true,
  
  localeTimeFormat: 'System',
  localeMeasurementSystem: 'System',
  
  easterEgg: false,
  separateWorkProfile: true,
};

type SettingKey = keyof LauncherSettings;

export function useSettings() {
  const { db, isLoading: dbLoading } = useDatabase();
  const [settingsState, setSettingsState] = useState<LauncherSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (dbLoading || !db) return;

    async function loadSettings() {
      try {
        setIsLoading(true);
        if (!db) return;
        const rows = await db.select().from(settings);
        
        const loadedSettings: Partial<LauncherSettings> = {};
        for (const row of rows) {
          const key = row.key as SettingKey;
          if (key in defaultSettings) {
            try {
              (loadedSettings as Record<string, unknown>)[key] = JSON.parse(row.value);
            } catch {
              (loadedSettings as Record<string, unknown>)[key] = row.value;
            }
          }
        }
        
        setSettingsState(prev => ({ ...prev, ...loadedSettings }));
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [db, dbLoading]);

  const updateSetting = useCallback(async <K extends SettingKey>(
    key: K,
    value: LauncherSettings[K]
  ) => {
    if (!db) return;

    setSettingsState(prev => ({ ...prev, [key]: value }));

    try {
      const serialized = JSON.stringify(value);
      await db
        .insert(settings)
        .values({
          key,
          value: serialized,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: {
            value: serialized,
            updatedAt: new Date(),
          },
        });
    } catch (error) {
      console.error(`Failed to save setting ${key}:`, error);
    }
  }, [db]);

  const updateSettings = useCallback(async (updates: Partial<LauncherSettings>) => {
    if (!db) return;

    setSettingsState(prev => ({ ...prev, ...updates }));

    try {
      for (const [key, value] of Object.entries(updates)) {
        const serialized = JSON.stringify(value);
        await db
          .insert(settings)
          .values({
            key,
            value: serialized,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: settings.key,
            set: {
              value: serialized,
              updatedAt: new Date(),
            },
          });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [db]);

  const resetSetting = useCallback(async <K extends SettingKey>(key: K) => {
    await updateSetting(key, defaultSettings[key]);
  }, [updateSetting]);

  const resetAllSettings = useCallback(async () => {
    if (!db) return;
    
    setSettingsState(defaultSettings);
    
    try {
      for (const [key, value] of Object.entries(defaultSettings)) {
        const serialized = JSON.stringify(value);
        await db
          .insert(settings)
          .values({
            key,
            value: serialized,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: settings.key,
            set: {
              value: serialized,
              updatedAt: new Date(),
            },
          });
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }, [db]);

  return {
    settings: settingsState,
    isLoading: isLoading || dbLoading,
    updateSetting,
    updateSettings,
    resetSetting,
    resetAllSettings,
  };
}
