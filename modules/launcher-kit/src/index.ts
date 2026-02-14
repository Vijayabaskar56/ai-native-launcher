import { NativeModules } from 'react-native';

const { LauncherKit } = NativeModules;

export interface AppInfo {
  packageName: string;
  label: string;
  icon: string;
}

const MOCK_APPS: AppInfo[] = [
  { packageName: 'com.android.chrome', label: 'Chrome', icon: '' },
  { packageName: 'com.google.android.gm', label: 'Gmail', icon: '' },
  { packageName: 'com.google.android.apps.maps', label: 'Maps', icon: '' },
  { packageName: 'com.android.settings', label: 'Settings', icon: '' },
  { packageName: 'com.android.camera2', label: 'Camera', icon: '' },
  { packageName: 'com.android.contacts', label: 'Contacts', icon: '' },
  { packageName: 'com.android.mms', label: 'Messages', icon: '' },
  { packageName: 'com.android.phone', label: 'Phone', icon: '' },
];

export default {
  getInstalledApps: (): Promise<AppInfo[]> => {
    if (!LauncherKit) return Promise.resolve(MOCK_APPS);
    return LauncherKit.getInstalledApps();
  },
  launchApp: (packageName: string): Promise<void> => {
    if (!LauncherKit) return Promise.resolve();
    return LauncherKit.launchApp(packageName);
  },
  openAppSettings: (packageName: string): Promise<void> => {
    if (!LauncherKit) return Promise.resolve();
    return LauncherKit.openAppSettings(packageName);
  },
  uninstallApp: (packageName: string): Promise<void> => {
    if (!LauncherKit) return Promise.resolve();
    return LauncherKit.uninstallApp(packageName);
  },
  hasQueryAllPackagesPermission: (): Promise<boolean> => {
    if (!LauncherKit) return Promise.resolve(false);
    return LauncherKit.hasQueryAllPackagesPermission();
  },
  requestQueryAllPackagesPermission: (): Promise<boolean> => {
    if (!LauncherKit) return Promise.resolve(false);
    return LauncherKit.requestQueryAllPackagesPermission();
  },
};
