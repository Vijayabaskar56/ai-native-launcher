# Technology Stack

**Analysis Date:** 2026-02-19

## Languages

**Primary:**
- TypeScript 5.9.2 - All application code (app, components, hooks, services)
- Kotlin - Native Android module for launcher functionality

**Secondary:**
- JavaScript - Configuration files (Metro, ESLint, Expo plugins)

## Runtime

**Environment:**
- React Native 0.81.5
- React 19.1.0
- Expo SDK ~54.0.33

**Package Manager:**
- Bun (lockfile: `bun.lock`)
- Lockfile: present

## Frameworks

**Core:**
- Expo ~54.0.33 - Cross-platform framework
- Expo Router ~6.0.23 - File-based routing
- React 19.1.0 - UI framework
- React Native 0.81.5 - Mobile platform

**Navigation:**
- Expo Router ~6.0.23 - File-based navigation
- @react-navigation/native ~7.1.8 - Navigation primitives
- @react-navigation/bottom-tabs ~7.4.0 - Tab navigation

**Styling:**
- NativeWind 5.0.0-preview.2 - Tailwind CSS for React Native
- Tailwind CSS 4 - Utility-first CSS framework
- @tailwindcss/postcss ~4.1.18 - PostCSS integration

**Database:**
- Drizzle ORM 0.45.1 - TypeScript ORM
- Expo SQLite ^16.0.10 - SQLite database driver

**Animation:**
- React Native Reanimated ~4.1.1 - Production-ready animations
- React Native Gesture Handler ~2.28.0 - Native gesture handling
- React Native Worklets 0.5.1 - Worklet runtime

**UI Components:**
- @shopify/flash-list ^2.2.2 - High-performance list rendering
- Expo Symbols ~1.0.8 - SF Symbols (iOS)
- Expo Image ~3.0.11 - Optimized image component

**Testing:**
- None detected - No test framework configured

**Build/Dev:**
- Metro - React Native bundler (configured via `metro.config.js`)
- Expo CLI - Development and build tooling
- Drizzle Kit 0.31.9 - Database migrations and management
- TypeScript 5.9.2 - Type checking and compilation

## Key Dependencies

**Critical:**
- expo-sqlite ^16.0.10 - Local database storage (SQLite)
- drizzle-orm 0.45.1 - Database ORM for all data operations
- expo-router ~6.0.23 - Application navigation structure
- react-native-reanimated ~4.1.1 - All animations and gestures
- nativewind 5.0.0-preview.2 - Styling system

**Infrastructure:**
- @react-native-async-storage/async-storage ^2.2.0 - Key-value storage
- expo-haptics ~15.0.8 - Haptic feedback
- expo-battery ~10.0.8 - Battery information
- expo-constants ~18.0.13 - App constants and metadata
- expo-linking ~8.0.11 - Deep linking

**Utilities:**
- clsx ^2.1.1 - Conditional class names
- tailwind-merge ^3.4.0 - Merge Tailwind classes

**Native Module:**
- launcher-kit - Custom Expo module (Android only)
  - Location: `modules/launcher-kit`
  - Platform: Android only
  - Purpose: Access Android launcher APIs (installed apps, shortcuts, app launching)

## Configuration

**Environment:**
- TypeScript strict mode enabled
- Expo's New Architecture enabled (`newArchEnabled: true`)
- React Compiler experimental feature enabled
- Typed routes experimental feature enabled

**Build:**
- `tsconfig.json` - TypeScript configuration (extends expo/tsconfig.base)
- `metro.config.js` - Metro bundler with NativeWind integration
- `eslint.config.js` - ESLint flat config with expo preset
- `drizzle.config.ts` - Database schema and migrations config
- `app.json` - Expo app configuration
- `modules/launcher-kit/app.plugin.js` - Custom Expo config plugin

**Path Aliases:**
- `@/*` - Project root
- `launcher-kit` - Native module (`modules/launcher-kit/src/index.ts`)

## Platform Requirements

**Development:**
- Node.js/Bun runtime
- TypeScript 5.9.2
- Android SDK (for native module development)

**Production:**
- Android only (launcher apps are Android-specific)
- Android API level compatible with Expo SDK 54
- SQLite database support
- Edge-to-edge display support enabled

**Deployment:**
- EAS (Expo Application Services)
  - Project ID: 04285bda-ebff-4f45-91f4-7bdd77cdc87e
  - Owner: vijayabaskar56

---

*Stack analysis: 2026-02-19*
