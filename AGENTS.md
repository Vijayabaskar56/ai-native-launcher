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

This project follows a **4-Layer Architecture** pattern, inspired by Kvaesitso:

```
┌─────────────────────────────────────────────────────────────────┐
│  UI Layer (React Native)                                        │
│  - Expo Router screens                                          │
│  - Components                                                   │
│  - Context Providers (Theme, Settings)                         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  Services Layer (TypeScript hooks + Context)                   │
│  - useSearch() - aggregates all search sources                  │
│  - useFavorites() - pinned items management                     │
│  - useBadges() - notification badges                            │
│  - useSettings() - settings management                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  Data Layer (Native Modules + React Native stores)             │
│  - Native modules for system API access                         │
│  - SQLite/MMKV for local persistence                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│  Core Layer (Types, Constants, Interfaces)                     │
│  - Shared type definitions                                      │
│  - Constants and configuration                                  │
│  - Repository interfaces                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Details

#### UI Layer (React Native)
Handles all visual rendering and user interaction:
- **Navigation**: Expo Router file-based routing
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Theme**: Light/dark mode with system detection
- **Animations**: React Native Reanimated
- **Gestures**: React Native Gesture Handler
- **UI Components**: All visual rendering
- **Styling**: Tailwind CSS v4 with NativeWind v5 and react-native-css

#### Services Layer (TypeScript)
Business logic and data orchestration:
- **Hooks**: Domain-specific hooks that aggregate data sources
- **Context**: React Context providers for shared state
- **State Machines**: Complex state transitions

#### Data Layer
Persistence and system integration:
- **SQLite/MMKV**: Local data persistence via Drizzle ORM
- **Native Modules**: Android system API access (see below)

#### Core Layer
Shared foundation:
- **Types**: TypeScript interfaces and types
- **Constants**: App-wide configuration
- **Repository Interfaces**: Contracts for data access

### Native Module Organization (Hybrid Approach)

Native modules are organized into logical groups:

```
modules/
├── launcher-kit/           # Core launcher APIs (always needed)
│   ├── Apps (PackageManager)
│   ├── Launch (Intents)
│   ├── Wallpaper (WallpaperManager)
│   ├── SystemBars (WindowInsets)
│   └── DefaultLauncher (role verification)
│
├── launcher-search/        # Search integrations pack
│   ├── Contacts (ContactsContract)
│   ├── Calendar (CalendarContract)
│   ├── Files (SAF, Nextcloud API)
│   └── AppShortcuts (LauncherApps)
│
├── launcher-widgets/       # Home screen widgets
│   ├── AppWidgetHost
│   ├── WidgetBinding
│   └── WidgetLayout
│
└── launcher-notifications/ # Notification badges & actions
    ├── NotificationListenerService
    ├── BadgeCounts
    └── AccessibilityService (gestures)
```

### Integration Pattern
```
UI Component → useSearch() → [LauncherSearch, SQLite] → Native Module
```

### Decision Framework
When adding new functionality:
1. **Can it be done in React Native?** → Do it in React Native
2. **Does it require Android system APIs?** → Add to appropriate native module
3. **Which module fits?** → launcher-kit (core), launcher-search (data), launcher-widgets, launcher-notifications

### Examples
| Functionality | Layer | Reason |
|---------------|-------|--------|
| App grid display | UI | Pure rendering |
| Swipe gestures | UI | Reanimated + Gesture Handler |
| Get installed apps | launcher-kit | PackageManager API |
| Contact search | launcher-search | ContactsContract API |
| Widget display | launcher-widgets | AppWidgetHost API |
| Notification badges | launcher-notifications | NotificationListenerService |
| Settings persistence | Data (SQLite) | Local storage |
| Search aggregation | Services | Business logic |

## Reference Implementation

**Goal**: Replace all features from Kvaesitso launcher (`references/Kvaesitso/`)

When working on new features or design decisions:
- Refer to `references/Kvaesitso/` for UI/UX patterns and feature implementations
- Study how Kvaesitso implements similar functionality natively
- Adapt native patterns to React Native where possible
- Add native module APIs only when system access is required
- Match Kvaesitso's layering: Services orchestrate, Data implements, UI presents

### Feature Implementation Status

| Feature | Module | Status |
|---------|--------|--------|
| App listing/launching | launcher-kit | ✅ Done |
| Wallpaper | launcher-kit | 📋 Planned |
| System bars | launcher-kit | 📋 Planned |
| Default launcher | launcher-kit | 📋 Planned |
| Contact search | launcher-search | 📋 Planned |
| Calendar search | launcher-search | 📋 Planned |
| File search | launcher-search | 📋 Planned |
| App shortcuts | launcher-search | 📋 Planned |
| Home widgets | launcher-widgets | 📋 Planned |
| Notification badges | launcher-notifications | 📋 Planned |
| Gesture actions | launcher-notifications | 📋 Planned |

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
  settings/             # Settings screens (Phase 1 & 2)
    _layout.tsx         # Stack navigator
    index.tsx           # Main settings screen
    appearance.tsx      # Theme, colors, shapes
    homescreen.tsx      # Clock, search bar, wallpaper
    icons.tsx           # Grid, icons, badges
    gestures.tsx        # Gesture actions
    locale.tsx          # Time, measurement
    about.tsx           # Version info
    search.tsx          # Phase 2
    integrations.tsx    # Phase 2
    plugins.tsx         # Phase 2
    backup.tsx          # Phase 2
    debug.tsx           # Phase 2

components/             # Reusable React components
  ui/                   # UI primitives (icons, collapsible, etc.)
  preferences/          # Settings preference components
    Preference.tsx
    PreferenceCategory.tsx
    SwitchPreference.tsx
    ListPreference.tsx
    SliderPreference.tsx
    PreferenceScreen.tsx
  app-drawer.tsx        # App drawer with gesture handling
  clock-widget.tsx      # Clock display widget
  dock.tsx              # Bottom dock for quick access apps
  app-icon.tsx          # Individual app icon component

hooks/                  # Custom React hooks (Services Layer)
  use-installed-apps.ts # Hook for fetching installed apps
  use-app-theme.tsx     # Theme context and hook
  use-color-scheme.ts   # Platform color scheme detection
  use-settings.ts       # Settings management hook
  use-search.ts         # Search aggregation hook
  use-favorites.ts      # Pinned items management
  use-badges.ts         # Notification badges

services/               # Business logic services
  settings-service.ts   # Settings persistence (SQLite/MMKV)
  search-service.ts     # Search orchestration
  favorites-service.ts  # Favorites CRUD

src/
  global.css            # Tailwind CSS imports and theme variables
  tw/                   # CSS-enabled component wrappers
    index.tsx           # View, Text, ScrollView, Pressable, etc.
    image.tsx           # Image component wrapper
    animated.tsx        # Animated component variants

core/                   # Core Layer (Types, Constants, Interfaces)
  types/                # TypeScript type definitions
    app.ts              # App-related types
    settings.ts         # Settings types
    search.ts           # Search-related types
  constants/            # App-wide configuration
    settings-labels.ts  # String labels for settings
    defaults.ts         # Default values
  interfaces/           # Repository contracts
    app-repository.ts
    search-repository.ts

modules/                # Native Modules (Data Layer)
  launcher-kit/         # Core launcher APIs
    src/index.ts        # TypeScript API
    android/            # Kotlin implementation
    expo-module.config.json
  launcher-search/      # Search integrations (Phase 2)
  launcher-widgets/     # Home screen widgets (Phase 2)
  launcher-notifications/ # Notification badges (Phase 2)

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

## Native Modules

### launcher-kit (Core)
Located in `modules/launcher-kit/`. Uses modern Expo Modules API.

**Available methods:**
- `getInstalledApps(): Promise<AppInfo[]>` - Get all launchable apps
- `launchApp(packageName: string): Promise<void>` - Launch an app
- `openAppSettings(packageName: string): Promise<void>` - Open app settings
- `uninstallApp(packageName: string): Promise<void>` - Trigger uninstall
- `hasQueryAllPackagesPermission(): Promise<boolean>` - Check permission
- `requestQueryAllPackagesPermission(): Promise<boolean>` - Request permission

**Planned methods:**
- `getWallpaper(): Promise<string>` - Get current wallpaper URI
- `setWallpaper(uri: string): Promise<void>` - Set wallpaper
- `setSystemBarsColor(statusBarColor: string, navBarColor: string): Promise<void>` - Set system bar colors
- `isDefaultLauncher(): Promise<boolean>` - Check if default launcher
- `requestDefaultLauncher(): Promise<void>` - Prompt to set as default

### launcher-search (Phase 2)
**Planned methods:**
- `searchContacts(query: string): Promise<Contact[]>` - Search contacts
- `searchCalendar(query: string): Promise<CalendarEvent[]>` - Search calendar events
- `searchFiles(query: string): Promise<FileInfo[]>` - Search files
- `getAppShortcuts(packageName: string): Promise<Shortcut[]>` - Get app shortcuts

### launcher-widgets (Phase 2)
**Planned methods:**
- `getWidgetProviders(): Promise<WidgetProvider[]>` - Get available widget providers
- `bindWidget(providerId: string): Promise<WidgetInfo>` - Bind a widget
- `removeWidget(widgetId: string): Promise<void>` - Remove a widget
- `updateWidget(widgetId: string): Promise<void>` - Update widget content

### launcher-notifications (Phase 2)
**Planned methods:**
- `getNotificationCounts(): Promise<NotificationCounts>` - Get badge counts per app
- `requestNotificationAccess(): Promise<boolean>` - Request notification access
- `hasNotificationAccess(): Promise<boolean>` - Check notification access
- `performGlobalAction(action: GlobalAction): Promise<void>` - Perform gesture actions (accessibility)

## Platform Notes

- **Android-only**: This is a launcher app, iOS doesn't support custom launchers
- `ios/` directory is deleted and iOS config removed from `app.json`
- Reference implementation in `references/Kvaesitso/` is available for patterns

## Key Files to Reference

- `app/_layout.tsx` - Root layout structure
- `hooks/use-app-theme.tsx` - Theme system
- `components/app-drawer.tsx` - Complex gesture handling example
- `modules/launcher-kit/android/src/main/kotlin/` - Native module implementation
