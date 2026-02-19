# Codebase Concerns

**Analysis Date:** 2026-02-19

## Tech Debt

**Dual Settings Systems:**
- Issue: Two parallel settings storage implementations exist - deprecated `services/settings-service.ts` using AsyncStorage and newer `db/use-settings.ts` using SQLite
- Files: `services/settings-service.ts`, `db/use-settings.ts`, `core/types/settings.ts`
- Impact: Settings data is fragmented. SettingsService defines `AppSettings` interface while useSettings defines `LauncherSettings` interface with completely different schemas. Some UI components may still reference the old system.
- Fix approach: Audit all settings consumers, migrate to SQLite-based system, remove SettingsService class and AsyncStorage dependency

**Database Migration System:**
- Issue: Manual migration system in `db/connection.ts` with hardcoded SQL strings instead of using Drizzle migrations
- Files: `db/connection.ts` (lines 37-337)
- Impact: Schema changes require careful manual SQL writing. No rollback capability. Migration tracking is custom-built.
- Fix approach: Use Drizzle Kit's migration system (`drizzle-kit generate`, `drizzle-kit migrate`)

**Large Settings Hook:**
- Issue: `db/use-settings.ts` is 380 lines with massive state management complexity and 135-field settings interface
- Files: `db/use-settings.ts` (380 lines), `core/types/settings.ts` (231 lines)
- Impact: Difficult to test, maintain, or extend. Any settings change requires loading entire state tree. Performance overhead from re-rendering.
- Fix approach: Split into category-specific hooks (useUISettings, useGestureSettings, etc.) with selective subscriptions

**Mock Fallbacks in Production:**
- Issue: App falls back to hardcoded MOCK_APPS when permission denied or LauncherKit fails
- Files: `hooks/use-installed-apps.ts` (lines 5-14, 44, 48)
- Impact: Users see fake Chrome/Gmail/Maps instead of actual apps. Misleading UX. Silently masks permission issues.
- Fix approach: Show permission prompt UI instead of mock data. Add retry mechanism.

**Inconsistent Error Handling:**
- Issue: Most catch blocks only log to console without user feedback or recovery
- Files: `db/use-settings.ts` (lines 274, 308, 336, 368), `hooks/use-favorites.ts` (lines 33, 77, 88, 144), `hooks/use-installed-apps.ts` (lines 32, 47, 62), `components/app-drawer.tsx` (lines 81, 112)
- Impact: Users don't know when operations fail. Failed database writes cause silent data loss.
- Fix approach: Add toast/snackbar notifications, implement retry logic, surface critical errors in UI

**Dead Zone Magic Number:**
- Issue: Hardcoded 10-pixel "dead zone" in gesture detection without explanation
- Files: `core/scaffold/use-scaffold-state.ts` (line 105)
- Impact: Small gestures ignored. May feel unresponsive on high-DPI screens.
- Fix approach: Calculate from screen density or make configurable

## Known Bugs

**Non-finite Calculator Results:**
- Symptoms: Calculator returns null for `1/0` and other infinity cases
- Files: `hooks/use-calculator.ts` (lines 83, 34)
- Trigger: Enter division by zero or expressions resulting in Infinity
- Workaround: None - silently fails

**App Drawer State Leak:**
- Symptoms: Search query and keyboard state persist when drawer closes via gesture
- Files: `components/app-drawer.tsx` (lines 131-132 - only clears on swipe down, not on app launch)
- Trigger: Open drawer, search, tap app - drawer closes but search state remains
- Workaround: Manually clear search field

**Database Provider Race Condition:**
- Symptoms: Settings hooks may receive null db if called before provider initializes
- Files: `db/use-settings.ts` (lines 252, 257 - checks dbLoading/!db but doesn't retry)
- Trigger: Load app, access settings immediately
- Workaround: Hooks show loading state but don't reload when db becomes available

## Security Considerations

**Sensitive Settings Logging:**
- Risk: Console logging exposes settings values that might contain user data
- Files: `db/use-settings.ts` (lines 274, 308), `services/settings-service.ts` (lines 18, 68)
- Current mitigation: None
- Recommendations: Redact sensitive fields in error logs, use structured logging with log levels

**No Input Sanitization in Calculator:**
- Risk: Arbitrary expression evaluation (though parser is bounded)
- Files: `hooks/use-calculator.ts` (entire file)
- Current mitigation: Custom parser limits operators
- Recommendations: Add expression length limit, rate limiting for evaluation

**Database Path Exposure:**
- Risk: Database named 'launcher.db' in default SQLite location - potentially accessible to other apps if permissions misconfigured
- Files: `db/connection.ts` (line 9)
- Current mitigation: Android/iOS sandboxing
- Recommendations: Verify file permissions, consider encryption for sensitive favorites/history

## Performance Bottlenecks

**Full Settings Reload on Every Change:**
- Problem: `updateSetting` and `updateSettings` trigger full state re-render for 135 fields
- Files: `db/use-settings.ts` (lines 283-338)
- Cause: Single useState for entire settings object
- Improvement path: Use React.useMemo for derived settings, split into multiple stores, or use Zustand/Jotai for granular updates

**FlashList with numColumns:**
- Problem: FlashList grid mode (numColumns={4}) has known performance issues with dynamic heights
- Files: `components/app-drawer.tsx` (line 173)
- Cause: FlashList recycling breaks with multi-column layouts
- Improvement path: Use FlatList for grid or implement windowed rendering manually

**Unoptimized Search Filtering:**
- Problem: Re-filters entire app list on every keystroke without debouncing
- Files: `components/app-drawer.tsx` (lines 51-59)
- Cause: useMemo re-runs on every searchQuery change
- Improvement path: Add debouncing (200ms), implement trie-based search for large app lists

**Scaffold Gesture Recalculation:**
- Problem: useScaffoldState creates new callback instances on every render
- Files: `core/scaffold/use-scaffold-state.ts` (callbacks not wrapped properly)
- Cause: Complex dependencies in useCallback
- Improvement path: Use useRef for stable config, reduce callback dependencies

## Fragile Areas

**Scaffold Animation System:**
- Files: `core/scaffold/use-scaffold-state.ts` (237 lines), `core/scaffold/launcher-scaffold.tsx`
- Why fragile: Complex state machine with SharedValues, gesture direction detection, and animation coordination. Subtle bugs in progress calculations could cause visual glitches.
- Safe modification: Always test all 8 gesture combinations (up/down/left/right swipe + double tap + long press). Log state transitions.
- Test coverage: No tests found

**Database Schema Evolution:**
- Files: `db/connection.ts` (migration array lines 57-326), all `db/schema/*.ts` files
- Why fragile: Manual migration hash tracking. Adding a migration requires updating hash + SQL + schema types in sync.
- Safe modification: Never modify existing migrations. Always append new migration objects. Test on fresh database.
- Test coverage: No migration tests found

**Component Registry Side Effects:**
- Files: `core/scaffold/launcher-scaffold.tsx` (lines 27-30), `core/scaffold/component-registry.ts`
- Why fragile: Relies on import side effects to register components. If imports are removed or lazy-loaded, scaffold breaks silently.
- Safe modification: Always check component-registry.ts when adding new scaffold pages
- Test coverage: No tests found

**Native Module Bridge:**
- Files: `modules/launcher-kit/src/index.ts`, `modules/launcher-kit/android/src/main/kotlin/expo/modules/launcherkit/LauncherKitModule.kt`
- Why fragile: TypeScript interface must match Kotlin implementation exactly. Permission handling has multiple failure modes.
- Safe modification: Update TypeScript types and Kotlin module in same commit. Test permission grant/deny flows.
- Test coverage: Mock tests in `.btca/resources/rn-launcher-kit/src/__tests__/` but no integration tests

## Scaling Limits

**In-Memory App List:**
- Current capacity: Loads all installed apps (~100-300 typical) into state
- Limit: Devices with 500+ apps may experience lag during initial load and search
- Scaling path: Implement virtualized search, paginate app drawer, cache app metadata in SQLite

**Favorites Without Pagination:**
- Current capacity: Loads all favorites on mount
- Limit: 50+ favorites could slow down favorites bar rendering
- Scaling path: Add limit to UI display, implement favorites pagination

**Settings JSON Serialization:**
- Current capacity: 135 settings fields serialized on every update
- Limit: Adding 100+ more settings (e.g., per-app configurations) would cause write delays
- Scaling path: Split settings into multiple tables, use binary formats for large configs

## Dependencies at Risk

**React 19 and React Native 0.81:**
- Risk: Cutting edge versions (React 19 released recently, using with RN 0.81)
- Impact: Potential incompatibilities with third-party libraries, limited community support for bug fixes
- Migration plan: Monitor React Native releases for official React 19 support, pin exact versions to avoid unexpected breakage

**NativeWind 5 Preview:**
- Risk: Using `nativewind: 5.0.0-preview.2` in production
- Impact: API changes before stable release could break styling
- Migration plan: Lock to specific preview version, prepare for breaking changes in final v5 release

**Expo SDK 54:**
- Risk: Potential breaking changes between preview releases
- Impact: `expo-sqlite`, `expo-router`, and other core dependencies may change APIs
- Migration plan: Test thoroughly before Expo SDK upgrades, review changelogs

## Missing Critical Features

**No Database Backup:**
- Problem: User favorites, settings, and search history stored in SQLite with no backup mechanism
- Blocks: Data loss on app uninstall or device reset
- Priority: High - users lose all customization

**No Error Boundaries:**
- Problem: React Error Boundaries not implemented
- Blocks: Single component crash brings down entire app
- Priority: High - poor reliability

**No Migration from AsyncStorage:**
- Problem: `migrateFavoritesFromAsyncStorage` function exists but is never called
- Files: `hooks/use-favorites.ts` (lines 110-146)
- Blocks: Users upgrading from hypothetical older version lose favorites
- Priority: Medium if upgrading existing users, Low if new app

**No Offline Handling:**
- Problem: No network state detection for weather/integrations
- Blocks: Silent failures when offline
- Priority: Medium - affects widget reliability

## Test Coverage Gaps

**Core Hooks Untested:**
- What's not tested: All custom hooks in `hooks/` directory
- Files: `hooks/use-settings.ts`, `hooks/use-favorites.ts`, `hooks/use-installed-apps.ts`, `hooks/use-calculator.ts`, `hooks/use-search.ts`, `hooks/use-widgets.ts`
- Risk: Settings corruption, favorites duplication, gesture bugs go unnoticed
- Priority: High

**Database Operations Untested:**
- What's not tested: All database CRUD operations, migrations, seeding
- Files: `db/connection.ts`, `db/use-settings.ts`, `db/provider.tsx`
- Risk: Data corruption, migration failures in production
- Priority: High

**Scaffold Gesture System Untested:**
- What's not tested: Gesture detection, direction locking, threshold calculations, animation triggers
- Files: `core/scaffold/use-scaffold-state.ts`, `core/scaffold/scaffold-gesture-handler.tsx`
- Risk: Core launcher interaction breaks silently
- Priority: High

**Component Integration Untested:**
- What's not tested: LauncherScaffold, AppDrawer, ClockWidget, SearchComponent, SettingsDrawer
- Files: All components in `components/` directory (except two tests in `.btca/resources/rn-launcher-kit/`)
- Risk: Visual regressions, interaction bugs
- Priority: Medium

---

*Concerns audit: 2026-02-19*
