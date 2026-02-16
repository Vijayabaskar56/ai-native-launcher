# Settings UI Implementation Plan

**Goal:** Implement a complete settings UI matching Kvaesitso's design, with SQLite persistence via Drizzle ORM.

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/`

---

## Phase Overview

| Phase | Scope | Tasks |
|-------|-------|-------|
| **Phase 1** | UI Components + Core Settings | Tasks 1-9 |
| **Phase 2** | Advanced Features + Integrations | Tasks 10-14 |

---

## Architecture

### Navigation Structure

```
Settings (full-screen modal from home)
├── Main Settings Screen (category list)
│   ├── Appearance → Theme, Colors, Shapes, Typography
│   ├── Home Screen → Clock, Search Bar, Wallpaper, System Bars
│   ├── Grid & Icons → Grid, Icons, Badges
│   ├── Gestures → Swipe, Tap, Button actions
│   ├── Search → Sources, Filters, Actions, Tags (Phase 2)
│   ├── Integrations → Weather, Media, Feed (Phase 2)
│   ├── Plugins → Installed plugins (Phase 2)
│   ├── Locale → Time format, Measurement
│   ├── Backup → Export/Import (Phase 2)
│   ├── Debug → Logs, Crash reports (Phase 2)
│   └── About → Version, Licenses
```

### Data Flow

```
UI Component → useSettings() hook → db/settings table → SQLite
```

---

## File Structure

```
app/settings/
├── _layout.tsx                    # Stack navigator
├── index.tsx                      # Main settings screen
├── appearance.tsx                 # Theme, colors, shapes
├── homescreen.tsx                 # Clock, search bar, wallpaper
├── icons.tsx                      # Grid, icons, badges
├── gestures.tsx                   # Gesture actions
├── locale.tsx                     # Time, measurement
├── about.tsx                      # Version info
├── search.tsx                     # Phase 2
├── integrations.tsx               # Phase 2
├── plugins.tsx                    # Phase 2
├── backup.tsx                     # Phase 2
└── debug.tsx                      # Phase 2

components/preferences/
├── PreferenceScreen.tsx           # Scaffold with TopAppBar
├── Preference.tsx                 # Basic preference item
├── PreferenceCategory.tsx         # Grouped preferences container
├── SwitchPreference.tsx           # Toggle switch
├── ListPreference.tsx             # Selection dialog
├── SliderPreference.tsx           # Slider with value display
├── PreferenceWithSwitch.tsx       # Clickable + embedded switch
├── GuardedPreference.tsx          # Permission-guarded wrapper
├── index.ts                       # Exports

constants/
└── settings-labels.ts             # String labels for all settings
```

---

## Task Breakdown

---

## Task 1: Preference Components Library

**Priority:** Critical (blocking all other tasks)
**Estimated Time:** 4 hours
**Can Parallelize:** No (foundation for all settings)

### Files to Create

#### 1.1 `components/preferences/Preference.tsx`

Basic preference item component.

```typescript
interface PreferenceProps {
  title: string;
  summary?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  controls?: React.ReactNode;
  enabled?: boolean;
}
```

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/component/preferences/Preference.kt`

**UI Specs:**
- Row layout: `[56dp icon] [title + summary] [controls]`
- Icon: 24dp, primary color, centered in 56dp box
- Title: `MaterialTheme.typography.titleMedium`
- Summary: `MaterialTheme.typography.bodyMedium`, onSurfaceVariant color
- Background: `surfaceBright`, rounded corners (extraSmall shape)
- Padding: 16dp vertical, 8dp start (with icon) or 16dp (without)
- Disabled: 0.38 alpha

---

#### 1.2 `components/preferences/PreferenceCategory.tsx`

Container for grouping related preferences.

```typescript
interface PreferenceCategoryProps {
  title?: string;
  children: React.ReactNode;
}
```

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/component/preferences/PreferenceCategory.kt`

**UI Specs:**
- Optional title: `titleSmall`, secondary color, 16dp padding
- Children container: `surfaceBright` background, medium rounded corners
- Gap between children: 2dp
- Title padding: 16dp start/end, 16dp top, 8dp bottom

---

#### 1.3 `components/preferences/SwitchPreference.tsx`

Toggle switch preference.

```typescript
interface SwitchPreferenceProps {
  title: string;
  summary?: string;
  icon?: React.ReactNode;
  value: boolean;
  onValueChanged: (value: boolean) => void;
  enabled?: boolean;
}
```

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/component/preferences/SwitchPreference.kt`

**UI Specs:**
- Extends Preference with Switch in controls slot
- Switch thumb: check/close icon based on state
- Click anywhere toggles the switch

---

#### 1.4 `components/preferences/ListPreference.tsx`

Selection dialog with radio buttons.

```typescript
interface ListPreferenceItem<T> {
  label: string;
  value: T;
}

interface ListPreferenceProps<T> {
  title: string;
  summary?: string;
  icon?: React.ReactNode;
  items: ListPreferenceItem<T>[];
  value: T | null;
  onValueChanged: (value: T) => void;
  enabled?: boolean;
}
```

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/component/preferences/ListPreference.kt`

**UI Specs:**
- Click opens modal dialog
- Dialog: extraLarge rounded corners, 16dp elevation
- Title: `titleLarge`, 24dp start/end, 16dp top, 8dp bottom
- Items: LazyColumn, 16dp start, 24dp end, 16dp vertical padding
- Radio button + label per item
- Summary shows selected item's label

---

#### 1.5 `components/preferences/SliderPreference.tsx`

Slider with value display.

```typescript
interface SliderPreferenceProps {
  title: string;
  icon?: React.ReactNode;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChanged: (value: number) => void;
  enabled?: boolean;
  label?: (value: number) => string;
}
```

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/component/preferences/SliderPreference.kt`

**UI Specs:**
- Title above slider
- Slider fills available width
- Value label: 56dp width, right-aligned, titleSmall
- Update on value change finished (not continuous)
- Decimal places based on step size

---

#### 1.6 `components/preferences/PreferenceWithSwitch.tsx`

Clickable preference with embedded switch.

```typescript
interface PreferenceWithSwitchProps {
  title: string;
  summary?: string;
  icon?: React.ReactNode;
  switchValue: boolean;
  onSwitchChanged: (value: boolean) => void;
  onClick: () => void;
  enabled?: boolean;
}
```

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/component/preferences/PreferenceWithSwitch.kt`

**UI Specs:**
- Switch on right side
- Click on left area triggers onClick
- Click on switch toggles without triggering onClick

---

#### 1.7 `components/preferences/GuardedPreference.tsx`

Wrapper for permission-gated preferences.

```typescript
interface GuardedPreferenceProps {
  locked: boolean;
  description: string;
  onUnlock: () => void;
  children: React.ReactNode;
}
```

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/component/preferences/GuardedPreference.kt`

**UI Specs:**
- When locked: show lock icon and description
- Unlock button triggers onUnlock
- When unlocked: render children normally

---

#### 1.8 `components/preferences/PreferenceScreen.tsx`

Scaffold for settings screens.

```typescript
interface PreferenceScreenProps {
  title: string;
  helpUrl?: string;
  children: (contentPadding: PaddingValues) => React.ReactNode;
}
```

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/component/preferences/PreferenceScreen.kt`

**UI Specs:**
- TopAppBar: center-aligned, back button, optional help button
- Container: `surfaceContainer` color
- TopAppBar color: `surfaceContainer`, scrolled: `surfaceContainerHigh`
- Content: LazyColumn with 12dp padding
- Gap between items: 12dp
- FAB support (animated visibility)

---

#### 1.9 `components/preferences/index.ts`

Export all components.

---

## Task 2: Settings Navigation Setup

**Priority:** Critical
**Estimated Time:** 1 hour
**Depends On:** Task 1

### Files to Create

#### 2.1 `app/settings/_layout.tsx`

Stack navigator for settings screens.

```typescript
// Use Expo Router Stack
// All settings screens as routes
// Full-screen modal presentation
```

**Navigation Specs:**
- Full-screen presentation
- Slide animation (horizontal)
- Back button in header (handled by PreferenceScreen)
- Gesture to go back enabled

---

#### 2.2 `app/settings/index.tsx`

Main settings screen with category list.

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/main/MainSettingsScreen.kt`

**UI Structure:**
```
PreferenceScreen(title="Settings")
└── PreferenceCategory
    ├── Preference(Appearance) → navigate to /settings/appearance
    ├── Preference(Home Screen) → navigate to /settings/homescreen
    ├── Preference(Grid & Icons) → navigate to /settings/icons
    ├── Preference(Gestures) → navigate to /settings/gestures
    ├── Preference(Search) → navigate to /settings/search (Phase 2)
    ├── Preference(Integrations) → navigate to /settings/integrations (Phase 2)
    ├── Preference(Plugins) → navigate to /settings/plugins (Phase 2)
    ├── Preference(Locale) → navigate to /settings/locale
    ├── Preference(Backup) → navigate to /settings/backup (Phase 2)
    ├── Preference(Debug) → navigate to /settings/debug (Phase 2)
    └── Preference(About) → navigate to /settings/about
```

**Icons (MaterialCommunityIcons):**
- Appearance: `palette`
- Home Screen: `home`
- Grid & Icons: `apps`
- Gestures: `gesture`
- Search: `magnify`
- Integrations: `power-plug`
- Plugins: `puzzle`
- Locale: `translate`
- Backup: `backup-restore`
- Debug: `bug`
- About: `information`

---

## Task 3: Appearance Settings Screen

**Priority:** High
**Estimated Time:** 2 hours
**Depends On:** Task 1, Task 2

### File: `app/settings/appearance.tsx`

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/appearance/AppearanceSettingsScreen.kt`

**Settings to Implement:**

| Setting | Type | DB Key | Options |
|---------|------|--------|---------|
| Theme | ListPreference | `uiColorScheme` | System, Light, Dark |
| Colors | Navigation | `uiColorsId` | → Color schemes list (Phase 2) |
| Typography | Navigation | `uiTypographyId` | → Typography list (Phase 2) |
| Shapes | Navigation | `uiShapesId` | → Shapes list (Phase 2) |
| Transparency | Navigation | `uiTransparenciesId` | → Transparencies list (Phase 2) |
| Import Theme | Action | - | File picker |
| Export Theme | Action | - | File save (Phase 2) |
| MDY Color Source | ListPreference | `uiCompatModeColors` | System, Wallpaper |

**UI Structure:**
```
PreferenceScreen(title="Appearance")
├── PreferenceCategory
│   └── ListPreference(Theme)
├── PreferenceCategory
│   ├── Preference(Colors) → navigate
│   ├── Preference(Typography) → navigate
│   ├── Preference(Shapes) → navigate
│   └── Preference(Transparency) → navigate
├── PreferenceCategory
│   ├── Preference(Import Theme)
│   └── Preference(Export Theme)
└── PreferenceCategory(Advanced) [Android 12+]
    └── ListPreference(MDY Color Source)
```

---

## Task 4: Home Screen Settings Screen

**Priority:** High
**Estimated Time:** 3 hours
**Depends On:** Task 1, Task 2

### File: `app/settings/homescreen.tsx`

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/homescreen/HomescreenSettingsScreen.kt`

**Settings to Implement:**

| Setting | Type | DB Key | Options/Range |
|---------|------|--------|---------------|
| Fixed Rotation | SwitchPreference | `uiOrientation` | true = Portrait, false = Auto |
| Clock Widget | Navigation | - | Bottom sheet config |
| Dock | SwitchPreference | `homeScreenDock` | true/false |
| Dock Rows | SliderPreference | `homeScreenDockRows` | 1-4 |
| Widgets on Home | SwitchPreference | `homeScreenWidgets` | true/false |
| Edit Button | SwitchPreference | `favoritesEditButton` | true/false |
| Search Bar Style | Custom Dialog | `searchBarStyle` | Transparent, Solid, Hidden |
| Search Bar Colors | Toggle Buttons | `searchBarColors` | Auto, Light, Dark |
| Search Bar Position | ListPreference | `searchBarBottom` | Top, Bottom |
| Fixed Search Bar | SwitchPreference | `searchBarFixed` | true/false |
| Wallpaper | Action | - | System picker (Phase 2) |
| Dim Wallpaper | SwitchPreference | `wallpaperDim` | true/false |
| Blur Wallpaper | SwitchPreference | `wallpaperBlur` | true/false |
| Blur Radius | SliderPreference | `wallpaperBlurRadius` | 4-64, step 4 |
| Charging Animation | SwitchPreference | `chargingAnimation` | true/false |
| Status Bar Icons | ListPreference | `systemBarsStatusColors` | Auto, Light, Dark |
| Nav Bar Icons | ListPreference | `systemBarsNavColors` | Auto, Light, Dark |
| Hide Status Bar | SwitchPreference | `systemBarsHideStatus` | true/false |
| Hide Nav Bar | SwitchPreference | `systemBarsHideNav` | true/false |

**UI Structure:**
```
PreferenceScreen(title="Home Screen")
├── PreferenceCategory
│   └── SwitchPreference(Fixed Rotation)
├── PreferenceCategory(Widgets)
│   ├── Preference(Clock Widget) → bottom sheet
│   ├── SwitchPreference(Dock)
│   ├── SliderPreference(Dock Rows) [visible when dock=true]
│   ├── SwitchPreference(Widgets on Home)
│   └── SwitchPreference(Edit Button)
├── PreferenceCategory(Search Bar)
│   ├── Preference(Search Bar Style) → custom bottom sheet
│   ├── ListPreference(Search Bar Position)
│   └── SwitchPreference(Fixed Search Bar)
├── PreferenceCategory(Wallpaper)
│   ├── Preference(Wallpaper) → system picker
│   ├── SwitchPreference(Dim Wallpaper)
│   ├── SwitchPreference(Blur Wallpaper)
│   └── SliderPreference(Blur Radius) [visible when blur=true]
├── PreferenceCategory(Animations)
│   └── SwitchPreference(Charging Animation)
└── PreferenceCategory(System Bars)
    ├── ListPreference(Status Bar Icons)
    ├── ListPreference(Nav Bar Icons)
    ├── SwitchPreference(Hide Status Bar)
    └── SwitchPreference(Hide Nav Bar)
```

**Special Component: SearchBarStylePreference**

Custom bottom sheet with visual previews of each search bar style:
- Transparent (with color toggle: Auto/Light/Dark)
- Solid
- Hidden

---

## Task 5: Grid & Icons Settings Screen

**Priority:** High
**Estimated Time:** 2.5 hours
**Depends On:** Task 1, Task 2

### File: `app/settings/icons.tsx`

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/icons/IconsSettingsScreen.kt`

**Settings to Implement:**

| Setting | Type | DB Key | Options/Range |
|---------|------|--------|---------------|
| Icon Size | SliderPreference | `gridIconSize` | 32-64, step 8 |
| Show Labels | SwitchPreference | `gridLabels` | true/false |
| List Style | SwitchPreference | `gridList` | true/false |
| List Icons | SwitchPreference | `gridListIcons` | true/false |
| Column Count | SliderPreference | `gridColumnCount` | 3-12 |
| Icon Shape | Custom Dialog | `iconsShape` | Grid of shapes |
| Enforce Shape | SwitchPreference | `iconsAdaptify` | true/false |
| Themed Icons | SwitchPreference | `iconsThemed` | true/false |
| Force Themed | SwitchPreference | `iconsForceThemed` | true/false |
| Icon Pack | Navigation | `iconsPack` | Pack selector (Phase 2) |
| Notification Badges | SwitchPreference | `badgesNotifications` | permission-gated |
| Cloud Badges | SwitchPreference | `badgesCloudFiles` | true/false |
| Suspended Badges | SwitchPreference | `badgesSuspendedApps` | true/false |
| Shortcut Badges | SwitchPreference | `badgesShortcuts` | true/false |
| Plugin Badges | SwitchPreference | `badgesPlugins` | true/false |

**UI Structure:**
```
PreferenceScreen(title="Grid and Icons")
├── PreferenceCategory(Grid)
│   ├── SliderPreference(Icon Size)
│   ├── SwitchPreference(Show Labels)
│   ├── SwitchPreference(List Style)
│   ├── SwitchPreference(List Icons) [visible when list=true]
│   └── SliderPreference(Column Count)
├── PreferenceCategory(Icons)
│   ├── IconPreviewRow (5 sample icons)
│   ├── Preference(Icon Shape) → grid dialog
│   ├── SwitchPreference(Enforce Shape)
│   ├── SwitchPreference(Themed Icons)
│   ├── SwitchPreference(Force Themed) [visible when themed=true]
│   └── Preference(Icon Pack)
└── PreferenceCategory(Badges)
    ├── GuardedPreference(Notification Badges)
    ├── SwitchPreference(Cloud Badges)
    ├── SwitchPreference(Suspended Badges)
    ├── SwitchPreference(Shortcut Badges)
    └── SwitchPreference(Plugin Badges)
```

**Special Component: IconShapePreference**

Grid dialog showing all icon shapes with preview:
- Platform Default, Circle, Square, Rounded Square
- Squircle, Triangle, Pentagon, Hexagon
- Teardrop, Pebble

---

## Task 6: Gestures Settings Screen

**Priority:** High
**Estimated Time:** 2 hours
**Depends On:** Task 1, Task 2

### File: `app/settings/gestures.tsx`

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/gestures/GestureSettingsScreen.kt`

**Settings to Implement:**

| Setting | Type | DB Key | Options |
|---------|------|--------|---------|
| Swipe Down | GesturePreference | `gesturesSwipeDown` | See actions below |
| Swipe Left | GesturePreference | `gesturesSwipeLeft` | See actions below |
| Swipe Right | GesturePreference | `gesturesSwipeRight` | See actions below |
| Swipe Up | GesturePreference | `gesturesSwipeUp` | See actions below |
| Double Tap | GesturePreference | `gesturesDoubleTap` | See actions below |
| Long Press | GesturePreference | `gesturesLongPress` | See actions below |
| Home Button | GesturePreference | `gesturesHomeButton` | See actions below |

**Gesture Actions:**
- NoAction
- Notifications
- QuickSettings
- ScreenLock (requires accessibility - show permission warning)
- Recents (requires accessibility)
- PowerMenu (requires accessibility)
- Search
- Widgets
- Feed
- Launch (app picker)

**UI Structure:**
```
PreferenceScreen(title="Gestures")
└── PreferenceCategory
    ├── GesturePreference(Swipe Down)
    ├── GesturePreference(Swipe Left)
    ├── GesturePreference(Swipe Right)
    ├── GesturePreference(Swipe Up)
    ├── GesturePreference(Double Tap)
    ├── GesturePreference(Long Press)
    └── GesturePreference(Home Button)
```

**Special Component: GesturePreference**

Row with ListPreference + optional app icon picker:
```
[Icon] [Title] [Summary] | [App Icon] (if Launch action)
```

When "Launch" is selected, show app picker.

---

## Task 7: Locale Settings Screen

**Priority:** Medium
**Estimated Time:** 1 hour
**Depends On:** Task 1, Task 2

### File: `app/settings/locale.tsx`

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/locale/LocaleSettingsScreen.kt`

**Settings to Implement:**

| Setting | Type | DB Key | Options |
|---------|------|--------|---------|
| Time Format | ListPreference | `localeTimeFormat` | System, 12-hour, 24-hour |
| Measurement | ListPreference | `localeMeasurementSystem` | System, Metric, UK, US |

**UI Structure:**
```
PreferenceScreen(title="Language and Region")
└── PreferenceCategory
    ├── ListPreference(Time Format)
    └── ListPreference(Measurement)
```

---

## Task 8: Search Actions Settings Screen

**Priority:** Medium
**Estimated Time:** 2 hours
**Depends On:** Task 1, Task 2

### File: `app/settings/search-actions.tsx`

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/searchactions/SearchActionsSettingsScreen.kt`

**Settings to Implement:**

Manage the quick actions bar (call, message, email, etc.)

| Action | DB Key | Default |
|--------|--------|---------|
| Call | `search_actions[0]` | type: call |
| Message | `search_actions[1]` | type: message |
| Email | `search_actions[2]` | type: email |
| Contact | `search_actions[3]` | type: contact |
| Alarm | `search_actions[4]` | type: alarm |
| Timer | `search_actions[5]` | type: timer |
| Calendar | `search_actions[6]` | type: calendar |
| Website | `search_actions[7]` | type: website |
| Web Search | `search_actions[8]` | type: websearch |
| Custom URL | `search_actions[9+]` | type: url, data: url |

**UI Structure:**
```
PreferenceScreen(title="Quick Actions")
├── PreferenceCategory
│   ├── Preference(Call) → edit sheet
│   ├── Preference(Message) → edit sheet
│   ├── ...
│   └── Preference(Custom URLs...)
└── FAB(Add Action)
```

**Edit Search Action Sheet:**
- Type selector
- Label input (for custom)
- URL input (for custom URL type)
- Icon picker
- Color picker

---

## Task 9: About Settings Screen

**Priority:** Low
**Estimated Time:** 1 hour
**Depends On:** Task 1, Task 2

### File: `app/settings/about.tsx`

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/about/AboutSettingsScreen.kt`

**Content:**
- App name
- Version (from app.json)
- Build info link
- Licenses link
- Easter egg trigger (tap version 7 times)

**UI Structure:**
```
PreferenceScreen(title="About")
├── AppIcon + AppName + Version
├── PreferenceCategory
│   ├── Preference(Build Info)
│   └── Preference(Licenses)
└── Credits / Links
```

---

## Task 10: Search Settings Screen (Phase 2)

**Priority:** Medium
**Estimated Time:** 4 hours
**Depends On:** Task 1-9

### File: `app/settings/search.tsx`

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/search/SearchSettingsScreen.kt`

**Settings:**
- Favorites toggle + settings
- Apps toggle + settings
- Files settings
- Contacts toggle + settings (permission-gated)
- Calendar toggle + settings (permission-gated)
- App Shortcuts (permission-gated)
- Calculator toggle
- Unit Converter toggle + settings
- Wikipedia toggle + settings
- Websites toggle
- Locations toggle + settings (permission-gated)
- Quick Actions link
- Hidden Items manager
- Tags manager
- Default Filter settings
- Filter Bar toggle + customization
- Keyboard auto-focus
- Launch on Enter
- Search results order

---

## Task 11: Integrations Settings Screen (Phase 2)

**Priority:** Low
**Estimated Time:** 3 hours
**Depends On:** Task 1-9

### File: `app/settings/integrations.tsx`

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/integrations/IntegrationsSettingsScreen.kt`

**Integrations:**
- Weather provider config
- Media player integration
- Feed integration (Nextcloud, Owncloud)
- Tasks integration
- Smartspacer integration

---

## Task 12: Plugins Settings Screen (Phase 2)

**Priority:** Low
**Estimated Time:** 2 hours
**Depends On:** Task 1-9

### File: `app/settings/plugins.tsx`

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/plugins/PluginsSettingsScreen.kt`

**Features:**
- List installed plugins
- Enable/disable per plugin
- Plugin-specific settings

---

## Task 13: Backup Settings Screen (Phase 2)

**Priority:** Low
**Estimated Time:** 2 hours
**Depends On:** Task 1-9

### File: `app/settings/backup.tsx`

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/backup/BackupSettingsScreen.kt`

**Features:**
- Create backup (export to file)
- Restore backup (import from file)
- Backup includes: settings, favorites, hidden items, tags

---

## Task 14: Debug Settings Screen (Phase 2)

**Priority:** Low
**Estimated Time:** 2 hours
**Depends On:** Task 1-9

### File: `app/settings/debug.tsx`

**Reference:** `references/Kvaesitso/app/ui/src/main/java/de/mm20/launcher2/ui/settings/debug/DebugSettingsScreen.kt`

**Features:**
- Log viewer
- Crash reports list
- Debug toggles

---

## Constants File

### `constants/settings-labels.ts`

```typescript
export const SETTINGS_LABELS = {
  // Appearance
  preference_screen_appearance: 'Appearance',
  preference_screen_appearance_summary: 'Customize the look and feel',
  preference_theme: 'Theme',
  preference_theme_system: 'System default',
  preference_theme_light: 'Light',
  preference_theme_dark: 'Dark',
  preference_screen_colors: 'Color scheme',
  preference_screen_typography: 'Typography',
  preference_screen_shapes: 'Shapes',
  preference_screen_transparencies: 'Transparency',
  
  // Home Screen
  preference_screen_homescreen: 'Home screen',
  preference_screen_homescreen_summary: 'Clock, search bar, wallpaper, system bars',
  preference_layout_fixed_rotation: 'Fixed portrait orientation',
  preference_category_widgets: 'Widgets',
  preference_screen_clockwidget: 'Clock',
  preference_clockwidget_favorites_part: 'Dock',
  preference_clockwidget_dock_rows: 'Dock rows',
  preference_widgets_on_home_screen: 'Widgets on home screen',
  preference_edit_button: 'Edit button',
  preference_category_searchbar: 'Search bar',
  preference_search_bar_style: 'Search bar style',
  preference_search_bar_style_transparent: 'Transparent',
  preference_search_bar_style_solid: 'Solid',
  preference_search_bar_style_hidden: 'Hidden',
  preference_layout_search_bar_position: 'Search bar position',
  search_bar_position_top: 'Top',
  search_bar_position_bottom: 'Bottom',
  preference_layout_fixed_search_bar: 'Fixed search bar',
  preference_category_wallpaper: 'Wallpaper',
  preference_dim_wallpaper: 'Dim wallpaper',
  preference_blur_wallpaper: 'Blur wallpaper',
  preference_blur_wallpaper_radius: 'Blur radius',
  preference_category_animations: 'Animations',
  preference_charging_animation: 'Charging animation',
  preference_category_system_bars: 'System bars',
  preference_status_bar_icons: 'Status bar icons',
  preference_nav_bar_icons: 'Navigation bar icons',
  preference_system_bar_icons_auto: 'Auto',
  preference_system_bar_icons_light: 'Light',
  preference_system_bar_icons_dark: 'Dark',
  preference_hide_status_bar: 'Hide status bar',
  preference_hide_nav_bar: 'Hide navigation bar',
  
  // Icons
  preference_screen_icons: 'Grid and icons',
  preference_screen_icons_summary: 'Grid size, icons, badges',
  preference_category_grid: 'Grid',
  preference_grid_icon_size: 'Icon size',
  preference_grid_labels: 'Show labels',
  preference_grid_labels_summary: 'Show app names below icons',
  preference_grid_list_style: 'List style',
  preference_grid_list_style_summary: 'Show apps in a vertical list',
  preference_grid_list_icons: 'Show icons in list',
  preference_grid_list_icons_summary: 'Show icons in list view',
  preference_grid_column_count: 'Column count',
  preference_category_icons: 'Icons',
  preference_icon_shape: 'Icon shape',
  preference_enforce_icon_shape: 'Enforce icon shape',
  preference_enforce_icon_shape_summary: 'Apply shape to all icons',
  preference_themed_icons: 'Themed icons',
  preference_themed_icons_summary: 'Use monochrome icons where available',
  preference_force_themed_icons: 'Force themed icons',
  preference_force_themed_icons_summary: 'Apply theme color to all icons',
  preference_icon_pack: 'Icon pack',
  preference_category_badges: 'Badges',
  preference_notification_badges: 'Notification badges',
  preference_cloud_badges: 'Cloud badges',
  preference_suspended_badges: 'Suspended app badges',
  preference_shortcut_badges: 'Shortcut badges',
  preference_plugin_badges: 'Plugin badges',
  
  // Icon Shapes
  preference_icon_shape_circle: 'Circle',
  preference_icon_shape_square: 'Square',
  preference_icon_shape_rounded_square: 'Rounded square',
  preference_icon_shape_squircle: 'Squircle',
  preference_icon_shape_triangle: 'Triangle',
  preference_icon_shape_pentagon: 'Pentagon',
  preference_icon_shape_hexagon: 'Hexagon',
  preference_icon_shape_teardrop: 'Teardrop',
  preference_icon_shape_pebble: 'Pebble',
  preference_value_system_default: 'System default',
  
  // Gestures
  preference_screen_gestures: 'Gestures',
  preference_screen_gestures_summary: 'Gestures and gesture actions',
  preference_gesture_swipe_down: 'Swipe down',
  preference_gesture_swipe_left: 'Swipe left',
  preference_gesture_swipe_right: 'Swipe right',
  preference_gesture_swipe_up: 'Swipe up',
  preference_gesture_double_tap: 'Double tap',
  preference_gesture_long_press: 'Long press',
  preference_gesture_home_button: 'Home button',
  
  // Gesture Actions
  gesture_action_none: 'None',
  gesture_action_notifications: 'Notifications',
  gesture_action_quick_settings: 'Quick settings',
  gesture_action_lock_screen: 'Lock screen',
  gesture_action_recents: 'Recents',
  gesture_action_power_menu: 'Power menu',
  gesture_action_open_search: 'Search',
  gesture_action_widgets: 'Widgets',
  gesture_action_feed: 'Feed',
  gesture_action_launch_app: 'Launch app',
  
  // Locale
  preference_screen_locale: 'Language and region',
  preference_screen_locale_summary: 'Language, units, time format',
  preference_time_format: 'Time format',
  preference_time_format_system: 'System default',
  preference_time_format_12h: '12-hour',
  preference_time_format_24h: '24-hour',
  preference_measurement_system: 'Measurement system',
  preference_measurement_system_metric: 'Metric',
  preference_measurement_system_uk: 'United Kingdom',
  preference_measurement_system_us: 'United States',
  
  // About
  preference_screen_about: 'About',
  preference_screen_about_summary: 'App and license information',
  
  // Other
  settings: 'Settings',
  help: 'Help',
  back: 'Back',
  save: 'Save',
  cancel: 'Cancel',
  done: 'Done',
};
```

---

## Testing Checklist

### Phase 1 Completion Criteria

- [ ] All preference components render correctly
- [ ] Navigation between settings screens works
- [ ] Settings persist to SQLite via useSettings()
- [ ] App restart restores settings correctly
- [ ] Theme switching works (Light/Dark/System)
- [ ] All gesture preferences save correctly
- [ ] Icon shape dialog shows all options
- [ ] Slider preferences update values correctly
- [ ] List preference dialogs work correctly

---

## Notes for Agents

1. **Always use `useSettings()` hook** - never access database directly from components
2. **Use MaterialCommunityIcons** from `@expo/vector-icons` for all icons
3. **Match Kvaesitso's visual style** - rounded corners, surface colors, proper spacing
4. **Test on Android only** - this is an Android launcher
5. **Run `npm run lint` after changes**
6. **Update `settings-labels.ts` when adding new strings**
