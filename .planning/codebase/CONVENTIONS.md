# Coding Conventions

**Analysis Date:** 2026-02-19

## Naming Patterns

**Files:**
- Components: kebab-case (e.g., `app-icon.tsx`, `search-bar.tsx`, `themed-text.tsx`)
- Hooks: kebab-case with `use-` prefix (e.g., `use-installed-apps.ts`, `use-calculator.ts`, `use-settings.ts`)
- Services: kebab-case with `-service` suffix (e.g., `settings-service.ts`)
- Types: kebab-case (e.g., `settings.ts` in `core/types/`)
- Platform-specific: kebab-case with platform suffix (e.g., `use-color-scheme.web.ts`, `icon-symbol.ios.tsx`)

**Functions:**
- Components: PascalCase (e.g., `AppIcon`, `SearchBar`, `AnalogClock`)
- Hooks: camelCase with `use` prefix (e.g., `useInstalledApps`, `useCalculator`, `useScaffoldState`)
- Helper functions: camelCase (e.g., `evaluate`, `parseExpression`, `getActionForDirection`)
- Event handlers: camelCase with `on` prefix (e.g., `onPress`, `onLongPress`, `onQueryChange`)

**Variables:**
- Constants (top-level): SCREAMING_SNAKE_CASE (e.g., `MOCK_APPS`, `CLOCK_SIZE`, `BAR_HEIGHT`, `SPRING_CONFIG`)
- Local variables: camelCase (e.g., `installedApps`, `hasPermission`, `hourDeg`)
- Component props: camelCase (e.g., `showLabel`, `onPress`, `autoFocus`)
- State variables: camelCase (e.g., `apps`, `loading`, `activeComponentId`)

**Types:**
- Interfaces: PascalCase (e.g., `AppInfo`, `PreferenceProps`, `ScaffoldConfiguration`)
- Type aliases: PascalCase (e.g., `ThemeMode`, `IconShape`, `GestureAction`)
- Enums: PascalCase for type, PascalCase for members (e.g., `ScaffoldAnimation`, `GestureDirection`)

## Code Style

**Formatting:**
- TypeScript with React Native
- 2-space indentation (inferred from source files)
- Single quotes for strings
- No trailing semicolons in import statements
- Semicolons used for statement termination
- Multi-line function calls: closing parenthesis on same line

**Linting:**
- ESLint with `eslint-config-expo` flat config
- Config file: `eslint.config.js`
- Run via: `npm run lint` or `expo lint`
- TypeScript strict mode enabled (`tsconfig.json`)

## Import Organization

**Order:**
1. External React/React Native imports
2. Third-party library imports
3. Expo SDK imports
4. Internal imports using `@/` alias

**Examples:**
```typescript
import { useEffect, useState, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import LauncherKit, { AppInfo } from 'launcher-kit';
```

```typescript
import { ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-app-theme';
```

**Path Aliases:**
- `@/*` - Maps to project root
- `launcher-kit` - Maps to `./modules/launcher-kit/src/index.ts`

## Error Handling

**Patterns:**
- Try-catch blocks with console.error for logging
- Fallback to safe defaults (e.g., MOCK_APPS when permission denied)
- Silent failures with logging (no user-facing errors thrown)
- Promise rejection handled with `.catch()` or try-catch in async functions

**Examples:**
```typescript
try {
  const installedApps = await LauncherKit.getInstalledApps();
  setApps(installedApps);
} catch (error) {
  console.error('Failed to load apps:', error);
  setApps(MOCK_APPS);
}
```

```typescript
const result = LauncherKitHelper.launchApplication(bundleId, params);
// Returns boolean instead of throwing
```

## Logging

**Framework:** `console` (built-in)

**Patterns:**
- `console.error()` for errors with descriptive context
- Format: `'Action description:', error`
- Examples: `console.error('Failed to load apps:', error)`, `console.error('Permission check failed:', error)`
- No verbose logging in production code
- No `console.log()` for debugging (cleaned up before commit)

## Comments

**When to Comment:**
- Complex algorithms (e.g., recursive descent parser in `use-calculator.ts`)
- Non-obvious behavior (e.g., "// Didn't consume entire input")
- Type definitions for clarity (e.g., "// Define mock types")
- TODOs/FIXMEs: Not currently used (zero found in codebase)

**JSDoc/TSDoc:**
- Not actively used
- Type information provided via TypeScript interfaces
- Props documented through interface definitions

## Function Design

**Size:**
- Small, focused functions (most under 30 lines)
- Complex logic extracted to helper functions (e.g., `parseExpression`, `parseTerm`, `parseAtom` in calculator)
- React components typically 50-150 lines including styles

**Parameters:**
- Use interfaces for component props
- Destructure props in function signature
- Optional parameters marked with `?` and given defaults
- Event handlers passed as callbacks (e.g., `onPress`, `onValueChanged`)

**Return Values:**
- React components return JSX
- Hooks return objects with destructured values (e.g., `{ apps, loading, launchApp, refreshApps }`)
- Utility functions return specific types (e.g., `number | null`, `boolean`, `Promise<boolean>`)
- Async functions return Promises

## Module Design

**Exports:**
- Named exports for components (e.g., `export function AppIcon`)
- Default export for route screens (e.g., `export default function HomeScreen()`)
- Type re-exports from hooks (e.g., `export type { AppInfo }`)
- Singleton instances for services (e.g., `export const settingsService`)

**Barrel Files:**
- Not used
- Direct imports from individual files

## React Patterns

**Hooks:**
- Custom hooks for state management (e.g., `useInstalledApps`, `useSettings`, `useCalculator`)
- `useState` for local component state
- `useCallback` for memoized functions (especially event handlers)
- `useMemo` for expensive computations
- `useEffect` for side effects and subscriptions
- React Native Reanimated's `useSharedValue`, `useAnimatedStyle` for animations

**Component Structure:**
1. Props interface definition
2. Component function with destructured props
3. Hooks (state, effects, refs)
4. Event handlers
5. Render logic
6. StyleSheet at bottom

**State Management:**
- Local state with `useState`
- Shared state via Context (e.g., `ThemeProvider`, `DatabaseProvider`)
- Singleton services for app-wide settings (`settingsService`)
- No external state management library (Redux, MobX, etc.)

## React Native Specific

**Styling:**
- `StyleSheet.create()` for all styles
- Inline styles for dynamic values (e.g., colors from theme)
- Style composition via array syntax
- Constants for sizes at top of file
- Themed colors accessed via `useTheme()` hook

**Platform Handling:**
- Platform-specific files (e.g., `.ios.tsx`, `.web.ts`)
- `Platform.select()` when needed (seen in constants)
- React Native Gesture Handler for gestures
- Expo SDK for native features

**Performance:**
- Reanimated for 60fps animations
- `useCallback` to prevent re-renders
- `useMemo` for computed values
- SharedValues for animation state

---

*Convention analysis: 2026-02-19*
