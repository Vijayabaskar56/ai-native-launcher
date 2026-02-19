# Architecture

**Analysis Date:** 2026-02-19

## Pattern Overview

**Overall:** Gesture-driven Launcher with Component Registry Pattern

**Key Characteristics:**
- Scaffold-based navigation system with swipe gestures mapping to pluggable page components
- State management through React hooks and singleton services with observer pattern
- Native module bridge for Android launcher functionality
- SQLite database with Drizzle ORM for persistent data
- Component self-registration pattern for extensible pages

## Layers

**Presentation Layer:**
- Purpose: UI components and screens
- Location: `app/`, `components/`
- Contains: React Native components, Expo Router screens, gesture handlers
- Depends on: Core layer (scaffold), Hooks layer, Services layer
- Used by: Entry point (`app/index.tsx`)

**Core/Scaffold Layer:**
- Purpose: Gesture-based navigation framework
- Location: `core/scaffold/`
- Contains: Gesture handlers, animation logic, component registry, state machines
- Depends on: Settings service, Native animation APIs
- Used by: Main launcher screen, scaffold page components

**Hooks Layer:**
- Purpose: Reusable stateful logic and data access
- Location: `hooks/`
- Contains: Custom React hooks for apps, favorites, settings, search, theme
- Depends on: Services layer, Database layer, Native modules
- Used by: All presentation components

**Services Layer:**
- Purpose: Singleton business logic and state management
- Location: `services/`
- Contains: Settings service with observer pattern
- Depends on: AsyncStorage
- Used by: Hooks layer

**Database Layer:**
- Purpose: Persistent data storage
- Location: `db/`
- Contains: Drizzle ORM schema, connection management, migrations
- Depends on: expo-sqlite
- Used by: Hooks layer (via context provider)

**Native Module Layer:**
- Purpose: Android launcher capabilities
- Location: `modules/launcher-kit/`
- Contains: TypeScript interface to native module
- Depends on: expo-modules-core
- Used by: Hooks layer (useInstalledApps, SearchComponent)

## Data Flow

**Gesture Navigation Flow:**

1. User performs gesture (swipe/tap) → `ScaffoldGestureHandler` captures event
2. `useScaffoldState` hook processes gesture → calculates direction, progress, animation type
3. `useScaffoldConfig` maps gesture to action based on user settings
4. If action is 'page' type → Component registry resolves component by ID
5. Animation system (`animations.ts`) applies visual transition
6. Secondary page component mounts with `ScaffoldComponentProps` (isActive, progress, onRequestClose)

**Settings Flow:**

1. Component calls `updateSetting()` from `useSettings()` hook
2. Hook delegates to `settingsService` singleton
3. Service updates in-memory state, persists to AsyncStorage
4. Service notifies all observers via subscription callbacks
5. All subscribed hooks re-render with new settings
6. Scaffold config recomputes gesture mappings

**App Launch Flow:**

1. User taps app icon → Component calls `launchApp(packageName)`
2. Hook invokes `LauncherKit.launchApp()` native module method
3. Native Android code launches app via Intent
4. Component dismisses drawer/search overlay

**State Management:**
- Local UI state: React useState/useReducer
- Shared app state: Singleton services with observer pattern (SettingsService)
- Persistent state: SQLite database accessed via Drizzle ORM
- Animated state: react-native-reanimated SharedValues

## Key Abstractions

**ScaffoldAction:**
- Purpose: Represents the outcome of a gesture
- Examples: `{ type: 'page', componentId: 'search', animation: ScaffoldAnimation.Push }`, `{ type: 'system', action: 'notifications' }`
- Pattern: Discriminated union type
- File: `core/scaffold/types.ts`

**ScaffoldComponentConfig:**
- Purpose: Defines a registerable page component for the scaffold
- Examples: Search, Widgets, Feed pages
- Pattern: Registry pattern with self-registration (components import side-effect register)
- File: `core/scaffold/component-registry.ts`

**AppSettings:**
- Purpose: Typed configuration structure for all launcher preferences
- Examples: `settings.gestures.gesturesSwipeUp`, `settings.grid.gridColumnCount`
- Pattern: Nested object with category segregation
- File: `core/types/settings.ts`

**Database Schema:**
- Purpose: Persistent storage entities
- Examples: `searchables`, `favorites`, `widgets`, `search_history`, `plugins`
- Pattern: Drizzle ORM table definitions with foreign keys
- File: `db/schema/`

## Entry Points

**App Entry Point:**
- Location: `app/_layout.tsx`
- Triggers: Expo Router at app launch
- Responsibilities: Initialize providers (GestureHandler, Database, Theme), configure navigation

**Home Screen:**
- Location: `app/index.tsx`
- Triggers: Default route navigation
- Responsibilities: Render LauncherScaffold (the main launcher UI)

**LauncherScaffold:**
- Location: `core/scaffold/launcher-scaffold.tsx`
- Triggers: Rendered by home screen
- Responsibilities: Orchestrate gesture handling, render home page (clock/dock), mount secondary pages, manage overlays (app drawer, settings)

**Database Initialization:**
- Location: `db/connection.ts` → `initializeDatabase()`
- Triggers: DatabaseProvider mount effect
- Responsibilities: Open SQLite database, run migrations, seed default data

**Scaffold Component Registration:**
- Location: Side-effect imports in `launcher-scaffold.tsx` (lines 27-30)
- Triggers: Module evaluation at import time
- Responsibilities: Components self-register with registry when imported (`SearchComponent`, `WidgetsComponent`, `ClockHomeComponent`)

## Error Handling

**Strategy:** Defensive with fallback to mock data

**Patterns:**
- Native module calls wrapped in try/catch with fallback to mock data (e.g., `useInstalledApps` returns MOCK_APPS on permission denial)
- Database errors logged to console, context provides `error` state
- Settings service catches AsyncStorage errors, continues with in-memory defaults
- Launch failures silently ignored (console.error only)

## Cross-Cutting Concerns

**Logging:** Console-based (console.error, console.log) - no structured logging framework

**Validation:** Implicit through TypeScript types, no runtime schema validation

**Authentication:** Not applicable (launcher app, no user authentication)

**Theming:** Context-based theme provider (`hooks/use-app-theme.tsx`) with settings-driven color scheme selection

**Haptic Feedback:** Expo Haptics used throughout for user interactions (app long-press, gesture completion, menu actions)

---

*Architecture analysis: 2026-02-19*
