# Codebase Structure

**Analysis Date:** 2026-02-19

## Directory Layout

```
claw-launcher/
├── app/                    # Expo Router screens (file-based routing)
│   ├── settings/          # Settings navigation screens
│   ├── _layout.tsx        # Root layout with providers
│   └── index.tsx          # Home screen (renders LauncherScaffold)
├── components/            # React Native UI components
│   ├── clock/             # Clock widget variants and parts
│   ├── preferences/       # Settings UI components
│   ├── search/            # Search page components
│   ├── ui/                # Low-level reusable UI elements
│   └── widgets/           # Widget system components
├── core/                  # Framework code
│   ├── constants/         # Static configuration values
│   ├── interfaces/        # TypeScript interfaces
│   ├── scaffold/          # Gesture navigation framework
│   └── types/             # Type definitions
├── db/                    # Database layer
│   ├── schema/            # Drizzle ORM table schemas
│   ├── connection.ts      # Database initialization and migrations
│   ├── provider.tsx       # React context for database access
│   └── index.ts           # Public API exports
├── hooks/                 # Custom React hooks
├── modules/               # Expo native modules
│   └── launcher-kit/      # Android launcher functionality bridge
├── services/              # Business logic singletons
├── src/                   # Compiled output / generated code
│   └── tw/                # Tailwind/NativeWind wrapper components
├── assets/                # Static resources (images, fonts)
├── constants/             # App-level constants
├── references/            # External reference code (Kvaesitso Android launcher)
└── scripts/               # Build/utility scripts
```

## Directory Purposes

**app/**
- Purpose: File-based routing structure for Expo Router
- Contains: Screen components, layout wrappers, navigation configuration
- Key files: `_layout.tsx` (root providers), `index.tsx` (home screen), `settings/index.tsx` (settings menu)

**components/**
- Purpose: Reusable React Native UI components organized by feature
- Contains: Feature components, composite widgets, presentational components
- Key files: `app-drawer.tsx` (app list overlay), `dock.tsx` (favorite apps bar), `settings-drawer.tsx` (settings overlay)

**core/scaffold/**
- Purpose: Gesture-based navigation framework
- Contains: Gesture handlers, animation logic, component registry, state management
- Key files: `launcher-scaffold.tsx` (main orchestrator), `component-registry.ts` (page registry), `types.ts` (framework types)

**core/types/**
- Purpose: Shared TypeScript type definitions
- Contains: Settings types, domain models
- Key files: `settings.ts` (AppSettings type and defaults)

**db/**
- Purpose: SQLite database layer with Drizzle ORM
- Contains: Schema definitions, connection management, migrations, context provider
- Key files: `connection.ts` (init/migrations), `schema/index.ts` (exports all tables), `provider.tsx` (React context)

**hooks/**
- Purpose: Custom React hooks for stateful logic
- Contains: Data fetching, local state management, side effects
- Key files: `use-installed-apps.ts` (app list), `use-settings.ts` (settings observer), `use-search.ts` (search logic)

**modules/launcher-kit/**
- Purpose: Expo native module for Android launcher APIs
- Contains: TypeScript interface to native Android code
- Key files: `src/index.ts` (native module interface)

**services/**
- Purpose: Singleton business logic with observer pattern
- Contains: SettingsService (singleton state manager)
- Key files: `settings-service.ts` (settings persistence and subscription)

**components/search/**
- Purpose: Search page feature components
- Contains: Search bar, results list, calculator, keyboard filters
- Key files: `search-component.tsx` (main page, self-registers with scaffold)

**components/clock/**
- Purpose: Clock widget variants and modular parts
- Contains: Different clock styles, reusable clock parts
- Key files: `clock-widget.tsx` (basic widget), `clock-home-component.tsx` (home page version), `clocks/` (variant implementations)

**components/preferences/**
- Purpose: Settings screen UI components
- Contains: Preference controls (switch, list, slider), preference screen layout
- Key files: `PreferenceScreen.tsx`, `SwitchPreference.tsx`, `ListPreference.tsx`

## Key File Locations

**Entry Points:**
- `app/_layout.tsx`: Root layout with GestureHandlerRootView, DatabaseProvider, ThemeProvider
- `app/index.tsx`: Home screen that renders LauncherScaffold
- `core/scaffold/launcher-scaffold.tsx`: Main launcher UI orchestrator

**Configuration:**
- `app.json`: Expo app configuration
- `package.json`: Dependencies and scripts
- `tsconfig.json`: TypeScript compiler configuration
- `drizzle.config.ts`: Drizzle ORM/Kit configuration
- `eslint.config.js`: ESLint rules
- `postcss.config.mjs`: PostCSS/Tailwind configuration
- `metro.config.js`: Metro bundler configuration

**Core Logic:**
- `core/scaffold/use-scaffold-state.ts`: Gesture state machine
- `core/scaffold/use-scaffold-config.ts`: Maps settings to scaffold actions
- `services/settings-service.ts`: Settings persistence and observer pattern
- `hooks/use-installed-apps.ts`: Interfaces with native module for app list

**Testing:**
- Not detected (no test files found)

**Database:**
- `db/connection.ts`: Migration runner and seeding
- `db/schema/`: Drizzle table definitions (searchables, favorites, widgets, etc.)

## Naming Conventions

**Files:**
- React components: `kebab-case.tsx` (e.g., `app-drawer.tsx`, `clock-widget.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-settings.ts`, `use-installed-apps.ts`)
- Services: `kebab-case-service.ts` (e.g., `settings-service.ts`)
- Types: `kebab-case.ts` (e.g., `settings.ts`)
- Platform-specific: `name.platform.tsx` (e.g., `icon-symbol.ios.tsx`)

**Directories:**
- Features: `kebab-case` (e.g., `launcher-kit`, `app-drawer`)
- Structural: `lowercase` (e.g., `components`, `hooks`, `services`)

**Components:**
- PascalCase for component names (e.g., `LauncherScaffold`, `SearchComponent`, `AppDrawer`)

**Functions/Variables:**
- camelCase for functions and variables (e.g., `useSettings`, `launchApp`, `currentProgress`)

**Types/Interfaces:**
- PascalCase for types and interfaces (e.g., `AppSettings`, `ScaffoldAction`, `GestureDirection`)

**Enums:**
- PascalCase for enum names and values (e.g., `ScaffoldAnimation.Rubberband`, `GestureDirection.Up`)

## Where to Add New Code

**New Scaffold Page (e.g., Calendar, Notes):**
- Primary code: `components/[feature]/[feature]-component.tsx`
- Register: Import in `core/scaffold/launcher-scaffold.tsx` as side-effect (lines 27-30)
- Component must call `registerScaffoldComponent()` on module load
- Must accept `ScaffoldComponentProps` interface

**New Hook:**
- Implementation: `hooks/use-[feature].ts`
- Export from file (no barrel export in hooks/)

**New Settings Category:**
- Add interface to `core/types/settings.ts`
- Add to `AppSettings` interface
- Update `DEFAULT_SETTINGS` constant
- Service automatically handles new category via generic type

**New UI Component:**
- Shared component: `components/[component-name].tsx`
- Feature-specific: `components/[feature]/[component-name].tsx`
- Low-level reusable: `components/ui/[component-name].tsx`

**New Database Table:**
- Schema: `db/schema/[table-name].ts`
- Export from `db/schema/index.ts`
- Add migration to `db/connection.ts` → `runMigrations()` function

**New Service:**
- Implementation: `services/[service-name]-service.ts`
- Export singleton instance
- Hook wrapper: `hooks/use-[service-name].ts`

**New Settings Screen:**
- Screen: `app/settings/[screen-name].tsx`
- Auto-routed by Expo Router
- Use `PreferenceScreen` component wrapper
- Use preference components from `components/preferences/`

**New Widget:**
- Implementation: `components/widgets/[widget-name]-widget.tsx`
- Import in `components/widgets/widgets-component.tsx` if needed for widgets page

**New Clock Style:**
- Implementation: `components/clock/clocks/[style]-clock.tsx`
- Register in clock selector (location TBD based on clock switching feature)

## Special Directories

**node_modules/**
- Purpose: NPM dependencies
- Generated: Yes
- Committed: No

**.expo/**
- Purpose: Expo development cache and builds
- Generated: Yes
- Committed: No

**references/**
- Purpose: External reference code (Kvaesitso Android launcher Java source)
- Generated: No
- Committed: Yes (appears to be reference documentation)

**src/tw/**
- Purpose: Tailwind/NativeWind wrapper components
- Generated: Partially (custom wrappers for styled components)
- Committed: Yes

**modules/launcher-kit/android/**
- Purpose: Native Android code for launcher functionality
- Generated: No (hand-written native module)
- Committed: Yes

**assets/**
- Purpose: Images, fonts, splash screens
- Generated: No
- Committed: Yes

**.planning/**
- Purpose: GSD codebase documentation
- Generated: Yes (by GSD commands)
- Committed: Likely yes (project-specific planning docs)

**docs/**
- Purpose: Project documentation
- Generated: No
- Committed: Yes

## Import Patterns

**Path Aliases:**
- `@/` → Project root (configured in `tsconfig.json`)
- Common: `@/components/`, `@/hooks/`, `@/core/`, `@/db/`, `@/services/`

**Import Order (observed):**
1. React/React Native core imports
2. Third-party libraries (expo, reanimated, etc.)
3. Local absolute imports (`@/...`)
4. Local relative imports (`./`, `../`)

---

*Structure analysis: 2026-02-19*
