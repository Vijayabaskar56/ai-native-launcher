import { requireNativeModule, requireNativeViewManager, EventEmitter } from 'expo-modules-core';
import { Platform } from 'react-native';

export interface AppInfo {
  packageName: string;
  label: string;
  icon: string;
}

export interface ShortcutInfo {
  id: string;
  packageName: string;
  shortLabel: string;
  longLabel: string;
  icon: string;
}

export interface WidgetProviderInfo {
  provider: string;
  packageName: string;
  className: string;
  label: string;
  minWidth: number;
  minHeight: number;
  resizeMode: number;
  configure: string;
}

export interface MediaSessionData {
  hasSession: boolean;
  title: string;
  artist: string;
  album: string;
  isPlaying: boolean;
  duration: number;
  position: number;
  packageName: string;
}

const LauncherKit = requireNativeModule('LauncherKit');

function tryRequireNativeModule(name: string): any {
  try {
    return requireNativeModule(name);
  } catch {
    return null;
  }
}

const MediaSession = Platform.OS === 'android' ? tryRequireNativeModule('MediaSession') : null;
const AppWidgetHostModuleNative = Platform.OS === 'android' ? tryRequireNativeModule('AppWidgetHostModule') : null;
const mediaSessionEmitter = MediaSession ? new EventEmitter(MediaSession) : null;

export const AppWidgetHostView = Platform.OS === 'android'
  ? requireNativeViewManager('AppWidgetHostView')
  : null;

const notAvailable = (name: string) => Promise.reject(new Error(`${name} not available — native rebuild required`));

export default {
  // App management
  getInstalledApps: (): Promise<AppInfo[]> => {
    return LauncherKit.getInstalledApps();
  },
  launchApp: (packageName: string): Promise<void> => {
    return LauncherKit.launchApp(packageName);
  },
  openAppSettings: (packageName: string): Promise<void> => {
    return LauncherKit.openAppSettings(packageName);
  },
  uninstallApp: (packageName: string): Promise<void> => {
    return LauncherKit.uninstallApp(packageName);
  },
  hasQueryAllPackagesPermission: (): Promise<boolean> => {
    return LauncherKit.hasQueryAllPackagesPermission();
  },
  requestQueryAllPackagesPermission: (): Promise<boolean> => {
    return LauncherKit.requestQueryAllPackagesPermission();
  },
  getAppShortcuts: (packageName: string): Promise<ShortcutInfo[]> => {
    return LauncherKit.getAppShortcuts(packageName);
  },
  launchShortcut: (packageName: string, shortcutId: string): Promise<void> => {
    return LauncherKit.launchShortcut(packageName, shortcutId);
  },

  // Media session
  isNotificationAccessGranted: (): Promise<boolean> => {
    if (!MediaSession) return Promise.resolve(false);
    return MediaSession.isNotificationAccessGranted();
  },
  openNotificationAccessSettings: (): Promise<void> => {
    if (!MediaSession) return notAvailable('MediaSession');
    return MediaSession.openNotificationAccessSettings();
  },
  getActiveMediaSession: (): Promise<MediaSessionData | null> => {
    if (!MediaSession) return Promise.resolve(null);
    return MediaSession.getActiveMediaSession();
  },
  startMediaListening: (): Promise<void> => {
    if (!MediaSession) return notAvailable('MediaSession');
    return MediaSession.startListening();
  },
  playPause: (): Promise<void> => {
    if (!MediaSession) return notAvailable('MediaSession');
    return MediaSession.playPause();
  },
  skipNext: (): Promise<void> => {
    if (!MediaSession) return notAvailable('MediaSession');
    return MediaSession.skipNext();
  },
  skipPrevious: (): Promise<void> => {
    if (!MediaSession) return notAvailable('MediaSession');
    return MediaSession.skipPrevious();
  },
  addMediaSessionListener: (callback: (data: MediaSessionData) => void) => {
    if (!mediaSessionEmitter) {
      return { remove: () => {} };
    }
    // @ts-expect-error EventEmitter generic types are strict in expo-modules-core
    return mediaSessionEmitter.addListener('onMediaSessionChanged', callback);
  },

  // AppWidget hosting
  getInstalledWidgetProviders: (): Promise<WidgetProviderInfo[]> => {
    if (!AppWidgetHostModuleNative) return Promise.resolve([]);
    return AppWidgetHostModuleNative.getInstalledWidgetProviders();
  },
  allocateAndBindWidget: (provider: string): Promise<number> => {
    if (!AppWidgetHostModuleNative) return notAvailable('AppWidgetHostModule');
    return AppWidgetHostModuleNative.allocateAndBindWidget(provider);
  },
  deleteWidget: (widgetId: number): Promise<void> => {
    if (!AppWidgetHostModuleNative) return notAvailable('AppWidgetHostModule');
    return AppWidgetHostModuleNative.deleteWidget(widgetId);
  },
  startWidgetHostListening: (): Promise<void> => {
    if (!AppWidgetHostModuleNative) return Promise.resolve();
    return AppWidgetHostModuleNative.startListening();
  },
  stopWidgetHostListening: (): Promise<void> => {
    if (!AppWidgetHostModuleNative) return Promise.resolve();
    return AppWidgetHostModuleNative.stopListening();
  },
};
