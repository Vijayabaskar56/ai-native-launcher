// Eagerly define globals to prevent Jest 30 sandbox errors.
// Expo's runtime.native.ts registers lazy getters that call require()
// inside global property accessors, which Jest 30 blocks as "outside scope".
// We eagerly set all of them to prevent the lazy require from firing.
Object.defineProperty(globalThis, '__ExpoImportMetaRegistry', {
  value: { url: 'http://localhost:8081' },
  configurable: true,
  enumerable: false,
  writable: true,
});

// structuredClone may not exist in Jest's RN sandbox, so Expo's lazy polyfill triggers
if (typeof globalThis.structuredClone === 'undefined' || 
    Object.getOwnPropertyDescriptor(globalThis, 'structuredClone')?.get) {
  Object.defineProperty(globalThis, 'structuredClone', {
    value: (obj) => JSON.parse(JSON.stringify(obj)),
    configurable: true,
    enumerable: false,
    writable: true,
  });
}

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

// Mock expo-image
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: View,
  };
});

// Mock expo-battery
jest.mock('expo-battery', () => ({
  getBatteryLevelAsync: jest.fn(() => Promise.resolve(0.75)),
  getBatteryStateAsync: jest.fn(() => Promise.resolve(2)),
  addBatteryLevelListener: jest.fn(() => ({ remove: jest.fn() })),
  addBatteryStateListener: jest.fn(() => ({ remove: jest.fn() })),
  BatteryState: { CHARGING: 2, FULL: 3, UNPLUGGED: 1 },
}));

// Mock expo-calendar
jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCalendarsAsync: jest.fn(() => Promise.resolve([])),
  getEventsAsync: jest.fn(() => Promise.resolve([])),
}));

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({ coords: { latitude: 0, longitude: 0 } })
  ),
}));

// Mock launcher-kit native module
jest.mock('launcher-kit', () => ({
  default: {
    getInstalledApps: jest.fn(() => Promise.resolve([])),
    launchApp: jest.fn(() => Promise.resolve()),
    openAppSettings: jest.fn(() => Promise.resolve()),
    uninstallApp: jest.fn(() => Promise.resolve()),
    hasQueryAllPackagesPermission: jest.fn(() => Promise.resolve(true)),
    requestQueryAllPackagesPermission: jest.fn(() => Promise.resolve(true)),
  },
}));

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(),
  })),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Silence console.warn for act() warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('An update to')
  ) {
    return;
  }
  originalWarn(...args);
};
