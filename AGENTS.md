# AGENTS.md - Claw Launcher Development Guide

This document provides guidelines for AI agents working on the Claw Launcher codebase.

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

## Project Overview

Claw Launcher is an Android-only launcher application built with:

- **Expo SDK 54** with React Native 0.81.5
- **Expo Router** for file-based navigation
- **Tailwind CSS v4** with NativeWind v5 and react-native-css
- **React Native Reanimated** for animations
- **Custom native module** (LauncherKit) for Android system integration

## Architecture

This project follows a **Layered Architecture** pattern:

### React Native Layer (UI & Business Logic)
Handles everything possible in React Native:
- **Navigation**: Expo Router file-based routing
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Theme**: Light/dark mode with system detection
- **Animations**: React Native Reanimated
- **Gestures**: React Native Gesture Handler
- **UI Components**: All visual rendering
- **Styling**: Tailwind CSS v4 with NativeWind v5 and react-native-css
- **Storage**: AsyncStorage for user preferences

### Native Module Layer (LauncherKit)
Handles only functionality that requires Android system APIs:
- `getInstalledApps()` - Query PackageManager for launchable apps
- `launchApp()` - Intent-based app launching with FLAG_ACTIVITY_NEW_TASK
- `openAppSettings()` - Open Settings.ACTION_APPLICATION_DETAILS_SETTINGS
- `uninstallApp()` - Trigger Intent.ACTION_DELETE
- `hasQueryAllPackagesPermission()` - Check QUERY_ALL_PACKAGES permission

### Integration Pattern
```
React Native UI → Hooks (use-installed-apps.ts) → LauncherKit (TS API) → Native Kotlin Module
```

### Decision Framework
When adding new functionality:
1. **Can it be done in React Native?** → Do it in React Native
2. **Does it require Android system APIs?** → Add to LauncherKit native module
3. **Does it require platform-specific UI?** → Use native module for data, RN for UI

### Examples
| Functionality | Layer | Reason |
|---------------|-------|--------|
| App grid display | React Native | Pure UI rendering |
| Swipe gestures | React Native | Reanimated + Gesture Handler |
| Get installed apps | Native Module | Requires PackageManager API |
| Launch an app | Native Module | Requires Intent system |
| Search filtering | React Native | Client-side array filtering |
| App favorites | React Native | AsyncStorage persistence |
| Wallpaper | Native Module | Requires WallpaperManager API |

## Reference Implementation

**Goal**: Replace all features from Kvaesitso launcher (`references/Kvaesitso/`)

When working on new features or design decisions:
- Refer to `references/Kvaesitso/` for UI/UX patterns and feature implementations
- Study how Kvaesitso implements similar functionality natively
- Adapt native patterns to React Native where possible
- Add native module APIs only when system access is required

### Future Native Functionality (Needs LauncherKit)
- Permission request flow (QUERY_ALL_PACKAGES)
- Wallpaper access (WallpaperManager)
- Home screen widgets (AppWidgetHost)
- Notification badges (NotificationListenerService)
- Recent apps (UsageStatsManager)
- Set as default launcher prompt
- App shortcuts (LauncherApps.getShortcutConfigurations)
- Badged icons (notification counts)

## Build Commands

```bash
# Development
npm start                    # Start Expo development server
npm run android              # Build and run on Android device/emulator

# Linting & Type Checking
npm run lint                 # Run ESLint

# TypeScript
npx tsc --noEmit             # Type check without emitting files

# Prebuild (regenerate native folders)
npx expo prebuild --clean    # Clean and regenerate android/
```

## Project Structure

```
app/                    # Expo Router screens (file-based routing)
  _layout.tsx           # Root layout with providers
  index.tsx             # Home screen (launcher main view)

components/             # Reusable React components
  ui/                   # UI primitives (icons, collapsible, etc.)
  app-drawer.tsx        # App drawer with gesture handling
  clock-widget.tsx      # Clock display widget
  dock.tsx              # Bottom dock for quick access apps
  app-icon.tsx          # Individual app icon component

hooks/                  # Custom React hooks
  use-installed-apps.ts # Hook for fetching installed apps
  use-app-theme.tsx     # Theme context and hook
  use-color-scheme.ts   # Platform color scheme detection

src/
  global.css            # Tailwind CSS imports and theme variables
  tw/                   # CSS-enabled component wrappers
    index.tsx           # View, Text, ScrollView, Pressable, etc.
    image.tsx           # Image component wrapper
    animated.tsx        # Animated component variants

modules/launcher-kit/   # Custom Expo native module
  src/index.ts          # TypeScript API for native module
  android/              # Kotlin native implementation
  expo-module.config.json

references/             # Reference implementations (git-ignored)
  Kvaesitso/            # Kvaesitso launcher for reference
```

## Code Style Guidelines

### Imports

Group imports in this order, separated by blank lines:

1. React and React Native imports
2. Third-party libraries (expo, react-navigation, etc.)
3. Local components (using `@/` alias)
4. Local hooks and utilities
5. Types and interfaces

```tsx
// React/React Native
import { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Text } from "react-native";

// Third-party
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

// Local imports with @ alias
import { useTheme } from "@/hooks/use-app-theme";
import { AppIcon } from "./app-icon";
import { AppInfo } from "@/hooks/use-installed-apps";
```

### Naming Conventions

- **Components**: PascalCase files and exports (`AppDrawer.tsx`, `export function AppDrawer()`)
- **Hooks**: camelCase with `use` prefix (`use-installed-apps.ts`, `useInstalledApps`)
- **Types/Interfaces**: PascalCase (`AppInfo`, `ThemeContextType`)
- **Constants**: SCREAMING_SNAKE_CASE for module-level, camelCase for function-level
- **Native modules**: Module name matches config (`LauncherKit`)

### Component Patterns

Use named exports for components:

```tsx
export function ComponentName({ prop1, prop2 }: Props) {
  // Implementation
}
```

Define styles using `StyleSheet.create` at the bottom of the file:

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

For Tailwind CSS styling, import from `@/src/tw`:

```tsx
import { View, Text } from "@/tw";

<View className="flex-1 bg-white p-4">
  <Text className="text-xl font-bold text-gray-900">Hello</Text>
</View>;
```

### TypeScript

- Use strict mode (enabled in tsconfig.json)
- Define interfaces for props and complex types
- Export types alongside values when relevant
- Use type annotations for function parameters and return types

```tsx
interface AppDrawerProps {
  apps: AppInfo[];
  onAppPress: (app: AppInfo) => void;
}

export function AppDrawer({ apps, onAppPress }: AppDrawerProps) {
  // ...
}
```

### Error Handling

- Wrap async operations in try-catch
- Log errors with descriptive messages
- Provide fallback behavior where appropriate

```tsx
const loadApps = useCallback(async () => {
  try {
    const installedApps = await LauncherKit.getInstalledApps();
    setApps(installedApps);
  } catch (error) {
    console.error("Failed to load apps:", error);
    setApps(MOCK_APPS); // Fallback
  }
}, []);
```

### Animations

Use React Native Reanimated for animations:

- `useSharedValue` for animated values
- `useAnimatedStyle` for style transformations
- `withSpring` for spring animations
- `runOnJS` when calling JS from worklets

```tsx
const translateY = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: translateY.value }],
}));
```

### Theme Support

Always use the theme context for colors:

```tsx
const { colors } = useTheme();

<View style={[styles.container, { backgroundColor: colors.background }]}>
```

Available colors: `background`, `surface`, `text`, `textSecondary`, `accent`, `border`, `dock`, `overlay`

## Native Module (LauncherKit)

Located in `modules/launcher-kit/`. Uses modern Expo Modules API.

Available methods:

- `getInstalledApps(): Promise<AppInfo[]>` - Get all launchable apps
- `launchApp(packageName: string): Promise<void>` - Launch an app
- `openAppSettings(packageName: string): Promise<void>` - Open app settings
- `uninstallApp(packageName: string): Promise<void>` - Trigger uninstall
- `hasQueryAllPackagesPermission(): Promise<boolean>` - Check permission
- `requestQueryAllPackagesPermission(): Promise<boolean>` - Request permission

## Platform Notes

- **Android-only**: This is a launcher app, iOS doesn't support custom launchers
- `ios/` directory is deleted and iOS config removed from `app.json`
- Reference implementation in `references/Kvaesitso/` is available for patterns

## Key Files to Reference

- `app/_layout.tsx` - Root layout structure
- `hooks/use-app-theme.tsx` - Theme system
- `components/app-drawer.tsx` - Complex gesture handling example
- `modules/launcher-kit/android/src/main/kotlin/` - Native module implementation
