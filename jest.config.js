/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '\\.btca/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^launcher-kit$': '<rootDir>/modules/launcher-kit/src/index.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@shopify/flash-list|@testing-library/react-native|nativewind|react-native-css|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|react-native-worklets|react-native-draggable-flatlist)',
  ],
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
    '**/*.test.{ts,tsx}',
  ],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'core/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
};
