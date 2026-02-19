# Claw Launcher - Widget System

## What This Is

An Android launcher app (Expo/React Native) getting a comprehensive widget system inspired by Kvaesitso. Users swipe up to access a centralized widget page where built-in widgets (clock, weather, music, favorites, calendar, notes) and Android system widgets from any app coexist in a scrollable, configurable layout.

## Core Value

Users can see all their important information at a glance — time, weather, music, calendar, favorites, and any Android widget — in one swipe-up gesture, organized exactly how they want it.

## Requirements

### Validated

- ✓ Gesture-based scaffold navigation — existing
- ✓ App search and launcher — existing
- ✓ Clock widgets (analog, digital, binary, orbit, segment) — existing
- ✓ App drawer with search — existing
- ✓ Settings system — existing
- ✓ SQLite database with widget table schema — existing
- ✓ Widget CRUD hook (useWidgets) — existing
- ✓ Scaffold component registration for widgets — existing

### Active

- [ ] Swipe up gesture opens widget page (change from long-press default)
- [ ] Built-in Clock widget with multiple styles
- [ ] Built-in Weather widget with real data
- [ ] Built-in Music widget with media session integration
- [ ] Built-in Favorites widget (quick-access pinned apps)
- [ ] Built-in Calendar widget showing upcoming events
- [ ] Built-in Notes widget with text editing
- [ ] Android AppWidget hosting via native Kotlin module
- [ ] Widget picker sheet (browse built-ins + system widgets, search)
- [ ] Widget sizing: border (padded card) vs full (edge-to-edge)
- [ ] Widget configuration sheets per widget type
- [ ] Drag-and-drop widget reordering
- [ ] Edit mode with drag handles, configure button, delete with undo
- [ ] Default widgets pre-populated on first launch
- [ ] Widget persistence and ordering in SQLite

### Out of Scope

- Widget-to-widget communication — unnecessary complexity for v1
- Custom widget SDK/plugin API — built-in + AppWidgets sufficient for now
- Widget animations/transitions — keep simple, polish later
- Widget grid layout (multi-column) — single column scrollable list for v1
- iOS support — Android-only launcher

## Context

- **Reference:** Kvaesitso launcher (Kotlin/Compose) at `references/Kvaesitso/` — mature widget system with AppWidget hosting, sizing, drag-and-drop, configuration sheets
- **Existing code:** Scaffold-based gesture navigation, placeholder weather/music widgets, SQLite schema ready, component registry pattern
- **Native module:** `launcher-kit` already bridges Android APIs — AppWidget hosting will extend this module
- **Architecture:** Hook-based state management, singleton services, Drizzle ORM, Reanimated animations

## Constraints

- **Tech stack**: Expo 54, React Native 0.81, React 19, TypeScript, Kotlin for native
- **Platform**: Android only (launcher app)
- **Native work**: AppWidget hosting requires Kotlin module extension + config plugin updates
- **Architecture**: Must follow existing scaffold/hook/service patterns

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Swipe up for widgets | Most natural gesture for "look up info" | — Pending |
| Single column layout | Simpler implementation, consistent with Kvaesitso | — Pending |
| Border vs Full sizing | Matches Kvaesitso approach, gives user control | — Pending |
| Extend launcher-kit for AppWidgets | Reuse existing native module infrastructure | — Pending |
| Built-in + AppWidget hybrid | Covers both polished defaults and infinite extensibility | — Pending |

---
*Last updated: 2026-02-19 after initialization*
