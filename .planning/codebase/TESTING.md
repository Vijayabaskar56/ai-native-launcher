# Testing Patterns

**Analysis Date:** 2026-02-19

## Test Framework

**Runner:**
- Jest (for native module testing)
- Config: `jest.config.js` (found in `.btca/resources/rn-launcher-kit/example/`)
- Preset: `react-native`

**Assertion Library:**
- Jest (built-in matchers)

**Run Commands:**
```bash
# No test scripts configured in main package.json
# Tests exist in native module example: .btca/resources/rn-launcher-kit/
```

## Test File Organization

**Location:**
- Co-located with source in `__tests__/` directory
- Example: `.btca/resources/rn-launcher-kit/src/__tests__/helper.test.tsx`
- Main app code has no tests currently

**Naming:**
- Pattern: `[name].test.tsx` or `[name].test.ts`
- Examples: `helper.test.tsx`, `installedApps.test.tsx`

**Structure:**
```
src/
├── __tests__/
│   ├── helper.test.tsx
│   └── installedApps.test.tsx
└── Helper.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe('ComponentName', () => {
  let mockDependency: MockType;
  let originalDependency: any;

  beforeEach(() => {
    originalDependency = NativeModules.SomeDependency;
    jest.clearAllMocks();
    mockDependency = NativeModules.SomeDependency as MockType;
  });

  afterEach(() => {
    // Restore original after each test
    NativeModules.SomeDependency = originalDependency;
  });

  describe('methodName', () => {
    it('should perform expected behavior', () => {
      // Test implementation
    });

    it('should handle errors gracefully', () => {
      // Error case
    });
  });
});
```

**Patterns:**
- Nested `describe()` blocks for grouping by component/method
- `beforeEach()` for setup and mock clearing
- `afterEach()` for cleanup and restoration
- Multiple `it()` blocks per method: success case + error cases
- Descriptive test names using "should" pattern

## Mocking

**Framework:** Jest (built-in)

**Patterns:**
```typescript
// Mock entire module
jest.mock('react-native', () => ({
  NativeModules: {
    LauncherKit: {
      launchApplication: jest.fn(),
      goToSettings: jest.fn(),
      // ... other methods
    },
  },
  Platform: {
    select: jest.fn((obj) => obj.default),
    OS: 'android',
  },
}));

// Mock implementation for specific test
mockLauncherKit.isPackageInstalled.mockImplementation(
  (_id: string, callback: (installed: boolean) => void) => {
    callback(true);
  }
);

// Mock resolved/rejected promises
mockLauncherKit.getDefaultLauncherPackageName.mockResolvedValue('com.example.launcher');
mockLauncherKit.openSetDefaultLauncher.mockRejectedValue(new Error('Failed'));

// Mock throw for error testing
mockLauncherKit.openAlarmApp.mockImplementation(() => {
  throw new Error('Failed to open alarm app');
});
```

**What to Mock:**
- Native modules (`NativeModules.LauncherKit`)
- React Native platform APIs
- External dependencies
- Callback-based APIs

**What NOT to Mock:**
- Pure utility functions
- TypeScript types/interfaces
- Simple helper methods

## Fixtures and Factories

**Test Data:**
```typescript
// Define mock types for type safety
type MockLauncherKit = {
  launchApplication: jest.Mock;
  goToSettings: jest.Mock;
  isPackageInstalled: jest.Mock;
  // ... other mocked methods
};

// Expected data structures
const expectedStatus: BatteryStatus = { level: 85, isCharging: true };
const expectedPackageName = 'com.example.launcher';
```

**Location:**
- Defined at top of test files
- Inline test data for simple cases
- Type definitions for mocks ensure type safety

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
# No coverage script configured
# Would typically be: jest --coverage
```

## Test Types

**Unit Tests:**
- Testing individual helper methods
- Mocking all dependencies
- Focused on single responsibility
- Examples: `LauncherKitHelper` method tests

**Integration Tests:**
- Not currently implemented
- Would test interaction between components/hooks

**E2E Tests:**
- Not used
- No framework configured (Detox, Appium, etc.)

## Common Patterns

**Async Testing:**
```typescript
it('should resolve with package name when successful', async () => {
  const expectedPackageName = 'com.example.launcher';
  mockLauncherKit.getDefaultLauncherPackageName.mockResolvedValue(
    expectedPackageName
  );

  const result = await LauncherKitHelper.getDefaultLauncherPackageName();

  expect(result).toBe(expectedPackageName);
});
```

**Error Testing:**
```typescript
it('should return false on error', () => {
  mockLauncherKit.openAlarmApp.mockImplementation(() => {
    throw new Error('Failed to open alarm app');
  });

  const result = LauncherKitHelper.openAlarmApp();

  expect(result).toBe(false);
});

it('should reject with error when operation fails', async () => {
  const error = new Error('Failed to open');
  mockLauncherKit.openSetDefaultLauncher.mockRejectedValue(error);

  await expect(LauncherKitHelper.openSetDefaultLauncher()).rejects.toBe(error);
});
```

**Callback Testing:**
```typescript
it('should resolve with battery status when successful', async () => {
  const expectedStatus: BatteryStatus = { level: 85, isCharging: true };
  mockLauncherKit.getBatteryStatus.mockImplementation(
    (callback: (level: number, isCharging: boolean) => void) => {
      callback(expectedStatus.level, expectedStatus.isCharging);
    }
  );

  const result = await LauncherKitHelper.getBatteryStatus();

  expect(result).toEqual(expectedStatus);
});
```

## Testing Gaps

**Current State:**
- Tests only exist in native module example (`.btca/resources/rn-launcher-kit/`)
- Main application code has zero tests
- No tests for:
  - React components (`components/`)
  - Custom hooks (`hooks/`)
  - Services (`services/`)
  - Core logic (`core/`)
  - App screens (`app/`)

**Recommendations:**
- Add Jest/React Native Testing Library to main package.json
- Test custom hooks (e.g., `useInstalledApps`, `useCalculator`, `useSettings`)
- Test complex components (e.g., `SearchBar`, `AppIcon`, clock widgets)
- Test services (e.g., `settingsService`)
- Test utility functions (e.g., calculator parser, gesture handlers)

---

*Testing analysis: 2026-02-19*
