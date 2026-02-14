import { useEffect, useState, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import LauncherKit, { AppInfo } from 'launcher-kit';

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

export type { AppInfo };

export function useInstalledApps() {
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  const checkAndRequestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const hasPerm = await LauncherKit.hasQueryAllPackagesPermission();
      if (hasPerm) {
        setHasPermission(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }, []);

  const loadApps = useCallback(async () => {
    try {
      const granted = await checkAndRequestPermission();
      if (granted) {
        const installedApps = await LauncherKit.getInstalledApps();
        setApps(installedApps);
      } else {
        setApps(MOCK_APPS);
      }
    } catch (error) {
      console.error('Failed to load apps:', error);
      setApps(MOCK_APPS);
    } finally {
      setLoading(false);
    }
  }, [checkAndRequestPermission]);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const launchApp = useCallback(async (packageName: string) => {
    try {
      await LauncherKit.launchApp(packageName);
    } catch (error) {
      console.error('Failed to launch app:', error);
    }
  }, []);

  return { apps, loading, launchApp, refreshApps: loadApps, hasPermission };
}
