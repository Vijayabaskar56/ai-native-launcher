export type ThemeMode = 'System' | 'Light' | 'Dark';
export type IconShape = 'PlatformDefault' | 'Circle' | 'Square' | 'RoundedSquare' | 'Squircle' | 'Triangle' | 'Pentagon' | 'Hexagon' | 'Teardrop' | 'Pebble';
export type GestureAction = 'NoAction' | 'Notifications' | 'QuickSettings' | 'ScreenLock' | 'Recents' | 'PowerMenu' | 'Search' | 'Widgets' | 'Feed' | 'Launch';
export type SystemBarColor = 'Auto' | 'Light' | 'Dark';
export type TimeFormat = 'System' | 'TwelveHour' | 'TwentyFourHour';
export type MeasurementSystem = 'Metric' | 'UnitedKingdom' | 'UnitedStates' | 'System';
export type SearchBarStyle = 'Transparent' | 'Solid' | 'Hidden';

export interface SearchFiltersState {
  allowNetwork: boolean;
  hiddenItems: boolean;
  apps: boolean;
  shortcuts: boolean;
  contacts: boolean;
  events: boolean;
  files: boolean;
  tools: boolean;
  websites: boolean;
  articles: boolean;
  places: boolean;
}

export interface UiSettings {
  uiColorScheme: ThemeMode;
  uiColorsId: string;
  uiTypographyId: string;
  uiShapesId: string;
  uiTransparenciesId: string;
  uiCompatModeColors: 'System' | 'Wallpaper';
}

export interface LayoutSettings {
  uiOrientation: boolean;
  homeScreenDock: boolean;
  homeScreenDockRows: number;
  homeScreenWidgets: boolean;
  favoritesEditButton: boolean;
  searchBarStyle: SearchBarStyle;
  searchBarColors: 'Auto' | 'Light' | 'Dark';
  searchBarBottom: boolean;
  searchBarFixed: boolean;
  wallpaperDim: boolean;
  wallpaperBlur: boolean;
  wallpaperBlurRadius: number;
  chargingAnimation: boolean;
  systemBarsStatusColors: SystemBarColor;
  systemBarsNavColors: SystemBarColor;
  systemBarsHideStatus: boolean;
  systemBarsHideNav: boolean;
}

export interface GridSettings {
  gridIconSize: number;
  gridLabels: boolean;
  gridList: boolean;
  gridListIcons: boolean;
  gridColumnCount: number;
}

export interface IconSettings {
  iconsShape: IconShape;
  iconsAdaptify: boolean;
  iconsThemed: boolean;
  iconsForceThemed: boolean;
  iconsPack: string;
}

export interface BadgeSettings {
  badgesNotifications: boolean;
  badgesCloudFiles: boolean;
  badgesSuspendedApps: boolean;
  badgesShortcuts: boolean;
  badgesPlugins: boolean;
}

export interface GestureSettings {
  gesturesSwipeDown: GestureAction;
  gesturesSwipeLeft: GestureAction;
  gesturesSwipeRight: GestureAction;
  gesturesSwipeUp: GestureAction;
  gesturesDoubleTap: GestureAction;
  gesturesLongPress: GestureAction;
  gesturesHomeButton: GestureAction;
  gesturesLaunchApp: string;
}

export interface LocaleSettings {
  localeTimeFormat: TimeFormat;
  localeMeasurementSystem: MeasurementSystem;
}

export interface SearchSourceSettings {
  searchFavorites: boolean;
  searchApps: boolean;
  searchFiles: boolean;
  searchContacts: boolean;
  searchCalendar: boolean;
  searchAppShortcuts: boolean;
  searchCalculator: boolean;
  searchUnitConverter: boolean;
  searchWikipedia: boolean;
  searchWebsites: boolean;
  searchLocations: boolean;
}

export interface SearchBehaviorSettings {
  searchBarKeyboard: boolean;
  searchBarAutoFocus: boolean;
  searchBarLaunchOnEnter: boolean;
  searchResultsBottomUp: boolean;
  filterBar: boolean;
  defaultFilter: string;
  searchFilter: SearchFiltersState;
}

export interface SearchAction {
  id: string;
  type: 'call' | 'message' | 'email' | 'contact' | 'alarm' | 'timer' | 'calendar' | 'website' | 'websearch' | 'url';
  label: string;
  url?: string;
  icon?: string;
  color?: string;
  position: number;
}

export interface IntegrationSettings {
  weatherProvider: string;
  mediaPlayer: boolean;
  feedEnabled: boolean;
  feedProvider: string;
  tasksEnabled: boolean;
  smartspacer: boolean;
}

export interface PluginInfo {
  id: string;
  name: string;
  author: string;
  version: string;
  enabled: boolean;
  hasSettings: boolean;
}

export interface AppSettings {
  ui: UiSettings;
  layout: LayoutSettings;
  grid: GridSettings;
  icons: IconSettings;
  badges: BadgeSettings;
  gestures: GestureSettings;
  locale: LocaleSettings;
  searchSources: SearchSourceSettings;
  searchBehavior: SearchBehaviorSettings;
  integrations: IntegrationSettings;
}

export const DEFAULT_SETTINGS: AppSettings = {
  ui: {
    uiColorScheme: 'System',
    uiColorsId: 'default',
    uiTypographyId: 'default',
    uiShapesId: 'default',
    uiTransparenciesId: 'default',
    uiCompatModeColors: 'System',
  },
  layout: {
    uiOrientation: false,
    homeScreenDock: true,
    homeScreenDockRows: 1,
    homeScreenWidgets: true,
    favoritesEditButton: false,
    searchBarStyle: 'Transparent',
    searchBarColors: 'Auto',
    searchBarBottom: false,
    searchBarFixed: false,
    wallpaperDim: true,
    wallpaperBlur: false,
    wallpaperBlurRadius: 16,
    chargingAnimation: true,
    systemBarsStatusColors: 'Auto',
    systemBarsNavColors: 'Auto',
    systemBarsHideStatus: false,
    systemBarsHideNav: false,
  },
  grid: {
    gridIconSize: 48,
    gridLabels: true,
    gridList: false,
    gridListIcons: true,
    gridColumnCount: 4,
  },
  icons: {
    iconsShape: 'Circle',
    iconsAdaptify: false,
    iconsThemed: false,
    iconsForceThemed: false,
    iconsPack: '',
  },
  badges: {
    badgesNotifications: false,
    badgesCloudFiles: false,
    badgesSuspendedApps: false,
    badgesShortcuts: false,
    badgesPlugins: false,
  },
  gestures: {
    gesturesSwipeDown: 'Search',
    gesturesSwipeLeft: 'NoAction',
    gesturesSwipeRight: 'NoAction',
    gesturesSwipeUp: 'Widgets',
    gesturesDoubleTap: 'ScreenLock',
    gesturesLongPress: 'NoAction',
    gesturesHomeButton: 'NoAction',
    gesturesLaunchApp: '',
  },
  locale: {
    localeTimeFormat: 'System',
    localeMeasurementSystem: 'System',
  },
  searchSources: {
    searchFavorites: true,
    searchApps: true,
    searchFiles: true,
    searchContacts: true,
    searchCalendar: true,
    searchAppShortcuts: true,
    searchCalculator: true,
    searchUnitConverter: true,
    searchWikipedia: true,
    searchWebsites: true,
    searchLocations: false,
  },
  searchBehavior: {
    searchBarKeyboard: true,
    searchBarAutoFocus: true,
    searchBarLaunchOnEnter: true,
    searchResultsBottomUp: false,
    filterBar: true,
    defaultFilter: 'all',
    searchFilter: {
      allowNetwork: false,
      hiddenItems: false,
      apps: true,
      shortcuts: true,
      contacts: true,
      events: true,
      files: true,
      tools: true,
      websites: true,
      articles: true,
      places: true,
    },
  },
  integrations: {
    weatherProvider: '',
    mediaPlayer: true,
    feedEnabled: false,
    feedProvider: '',
    tasksEnabled: false,
    smartspacer: false,
  },
};
