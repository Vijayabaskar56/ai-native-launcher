# External Integrations

**Analysis Date:** 2026-02-19

## APIs & External Services

**None detected** - No external API integrations found in the codebase. This is a fully offline Android launcher application.

## Data Storage

**Databases:**
- SQLite (via Expo SQLite)
  - Connection: Local file at `launcher.db`
  - Client: Drizzle ORM
  - Location: `db/connection.ts`
  - Schema: `db/schema/index.ts`
  - Tables: searchables, favorites, widgets, search_actions, search_history, tags, colors, themes, weather_forecasts, currencies, icon_packs, icons, plugins, settings

**File Storage:**
- Local filesystem only
  - App icons stored as Base64 strings in database
  - Custom icons/resources in assets directory

**Caching:**
- AsyncStorage - Key-value storage for app state
  - Package: `@react-native-async-storage/async-storage ^2.2.0`

## Authentication & Identity

**Auth Provider:**
- None - No authentication system

**User Management:**
- Single-user Android launcher app
- No user accounts or login system

## Monitoring & Observability

**Error Tracking:**
- None - No external error tracking service

**Logs:**
- Console logging only
- No centralized logging service

**Analytics:**
- None - No analytics tracking detected

## CI/CD & Deployment

**Hosting:**
- Google Play Store (Android app)
  - Package: `com.claw.launcher`

**CI Pipeline:**
- EAS Build (Expo Application Services)
  - Project ID: 04285bda-ebff-4f45-91f4-7bdd77cdc87e
  - Owner: vijayabaskar56

**Build Configuration:**
- Expo build properties plugin
- Custom config plugin for launcher intent filters

## Environment Configuration

**Required env vars:**
- None - Application runs fully offline with no API keys required

**Secrets location:**
- Not applicable - No secrets needed

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Native Platform APIs

**Android System Services:**
- LauncherApps API - Access installed apps and shortcuts
  - Module: `modules/launcher-kit/android/src/main/kotlin/expo/modules/launcherkit/LauncherKitModule.kt`
  - Permissions: `android.permission.QUERY_ALL_PACKAGES`
  - Functions: getInstalledApps, launchApp, getAppShortcuts, launchShortcut

- PackageManager - Query and manage installed applications
  - Purpose: List launchable apps, app metadata, app icons

- Intent System - Launch apps and system activities
  - Actions: ACTION_MAIN, ACTION_DELETE, ACTION_APPLICATION_DETAILS_SETTINGS
  - Categories: CATEGORY_HOME, CATEGORY_LAUNCHER

**Expo Modules:**
- expo-battery ~10.0.8 - Battery level and state
- expo-haptics ~15.0.8 - Vibration feedback
- expo-system-ui ~6.0.9 - System UI customization
- expo-splash-screen ~31.0.13 - Splash screen management
- expo-status-bar ~3.0.9 - Status bar styling
- expo-web-browser ~15.0.10 - In-app browser

## Data Schemas

**Local Database Tables:**

All data stored in local SQLite database (`launcher.db`):

- **searchables** - Searchable items (apps, contacts, etc.)
- **favorites** - User-favorited items
- **widgets** - Home screen widgets configuration
- **search_actions** - Quick actions in search
- **search_history** - Search query history
- **tags** - User-defined tags for organization
- **tag_items** - Many-to-many relationship for tags
- **colors** - Material Design color palettes
- **shapes** - Material Design shape tokens
- **typography** - Typography configuration
- **transparencies** - Transparency/blur settings
- **weather_forecasts** - Cached weather data (local only)
- **currencies** - Cached currency exchange rates (local only)
- **icon_packs** - Installed icon packs metadata
- **icons** - Custom icon mappings
- **plugins** - Launcher plugins/extensions
- **settings** - Key-value settings storage

**Note:** Weather and currency tables exist in schema but no external API integrations detected. These may be placeholder tables for future features or populated via user input/manual data.

## Plugin System

**Architecture:**
- Custom plugin system for extensibility
- Plugins table stores: authority, label, description, package_name, class_name, type, settings_activity, enabled
- No plugins currently registered in codebase

## Deep Linking

**Scheme:**
- `clawlauncher://` - Custom URL scheme
  - Configured in `app.json`
  - Handled by Expo Linking

**Universal Links:**
- Not configured

---

*Integration audit: 2026-02-19*
