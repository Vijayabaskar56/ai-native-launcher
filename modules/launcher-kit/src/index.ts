import { requireNativeModule } from 'expo-modules-core';

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

const LauncherKit = requireNativeModule('LauncherKit');

export default {
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
};
