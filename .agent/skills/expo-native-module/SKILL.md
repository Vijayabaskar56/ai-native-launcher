---
name: expo-native-module
description: >
  Create native modules, native views, config plugins, and third-party library wrappers
  using the Expo Modules API (Kotlin + Swift). Use this skill whenever the user wants to
  create an Expo native module, write native code for an Expo/React Native app, wrap a
  native iOS or Android library for use in React Native, build a native UI component or
  view, create a config plugin that injects values into AndroidManifest.xml or Info.plist,
  or set up a standalone Expo module (monorepo or npm). Trigger on phrases like "native module",
  "expo module", "native view", "config plugin", "wrap native library", "bridge native code",
  "Kotlin module", "Swift module", "expo modules API", "create-expo-module", or any request
  involving writing platform-specific Android/iOS code within an Expo project.
---

# Expo Native Module Skill

Build native modules, native views, config plugins, and third-party library wrappers
using the Expo Modules API with Kotlin (Android) and Swift (iOS).

## Quick Decision Tree

Before writing any code, determine what the user needs:

| User wants to...                              | Type             | Reference file                          |
|-----------------------------------------------|------------------|-----------------------------------------|
| Expose a native API (no UI)                   | Native Module    | `references/native-module.md`           |
| Render a native UI component                  | Native View      | `references/native-view.md`             |
| Inject config into AndroidManifest/Info.plist  | Config Plugin    | `references/config-plugin.md`           |
| Wrap an existing iOS/Android library           | Third-Party Wrap | `references/third-party-library.md`     |
| Use a module in a monorepo or publish to npm   | Standalone Module| `references/standalone-module.md`       |

Read the relevant reference file(s) before generating code. Multiple references may apply
(e.g., a third-party wrap that also needs a config plugin).

---

## Core Workflow

Every Expo native module follows this sequence:

### 1. Scaffold the module

```bash
# Standalone module (own repo / npm package)
npx create-expo-module <module-name>

# Local module inside an existing Expo project
npx create-expo-module --local <module-name>
```

The scaffold creates:
```
<module-name>/
├── android/src/main/java/expo/modules/<name>/
│   ├── <Name>Module.kt          # Android native module
│   └── <Name>View.kt            # Android native view (if applicable)
├── ios/
│   ├── <Name>Module.swift        # iOS native module
│   └── <Name>View.swift          # iOS native view (if applicable)
├── src/
│   ├── index.ts                  # Public API
│   ├── <Name>Module.ts           # NativeModule binding
│   ├── <Name>.types.ts           # Shared TypeScript types
│   └── <Name>View.tsx            # React component for native view (if applicable)
├── example/                      # Example app (standalone only)
└── package.json
```

### 2. Clean up the scaffold

Remove files you don't need. If building a module-only (no view), delete the View files.
If building a view-only, you still keep the Module file since the View is registered through it.

### 3. Implement native code

Write the platform-specific logic in Kotlin (Android) and Swift (iOS) using the
`ModuleDefinition` DSL. The key building blocks are:

**Module Definition DSL (both platforms)**
```
Name("ModuleName")                    // Required: JS-visible module name
Function("fnName") { args -> ... }    // Sync function
AsyncFunction("fnName") { args -> ... } // Async function
Property("propName") { ... }          // Read-only property
Events("eventName")                   // Declare emittable events
Constants { mapOf("key" to value) }   // Static constants

// For views:
View(MyView::class) {                 // Register a native view
  Prop("propName") { view, value -> } // View prop setter
  Events("onEvent")                   // View event callbacks
}
```

### 4. Create TypeScript bindings

```typescript
// For modules (no UI):
import { NativeModule, requireNativeModule } from 'expo';

declare class MyModule extends NativeModule<MyModuleEvents> {
  myFunction(arg: string): string;
}

export default requireNativeModule<MyModule>('ModuleName');

// For views:
import { requireNativeViewManager } from 'expo-modules-core';

const NativeView: React.ComponentType<Props> = requireNativeViewManager('ModuleName');
```

### 5. Export the public API

Create a clean public API in `src/index.ts` that wraps the native module calls.
This is what consumers import.

### 6. Build and run

```bash
# Watch TypeScript changes
npm run build

# In example/ or your app:
npx expo prebuild --clean   # Regenerate native projects
npx expo run:android         # Build & run on Android
npx expo run:ios             # Build & run on iOS
```

---

## Key Patterns

### Type Safety with Enums

Define enums on both native sides and TypeScript for type-safe string unions:

**Kotlin:** `enum class Theme(val value: String) : Enumerable { LIGHT("light"), DARK("dark") }`
**Swift:** `enum Theme: String, Enumerable { case light, dark }`
**TypeScript:** `export type Theme = 'light' | 'dark';`

The Expo Modules API automatically validates enum values at the bridge boundary and throws
descriptive errors for invalid values.

### Events

To emit events from native to JS:
1. Declare events: `Events("onSomething")`
2. Emit from native: `sendEvent("onSomething", mapOf("key" to value))` (Kotlin) /
   `sendEvent("onSomething", ["key": value])` (Swift)
3. Subscribe in TS: `module.addListener("onSomething", callback)`

For view events, use `EventDispatcher`:
- **Kotlin:** `private val onLoad by EventDispatcher()`  then `onLoad(mapOf(...))`
- **Swift:** `let onLoad = EventDispatcher()` then `onLoad(["key": value])`
- **TS:** Props include `onLoad?: (event: { nativeEvent: Payload }) => void`

### Records (Structured Data)

Pass structured data between JS and native using Records:

**Kotlin:**
```kotlin
class Series : Record {
  @Field val color: String = "#ff0000"
  @Field val percentage: Float = 0.0f
}
```

**Swift:**
```swift
struct Series: Record {
  @Field var color: UIColor = .black
  @Field var percentage: Double = 0
}
```

### Native Dependencies

**Android (build.gradle):**
```groovy
dependencies {
  implementation 'com.example:library:1.0.0'
}
```

**iOS (podspec):**
```ruby
s.dependency 'LibraryName', '~> 1.0'
```

For `.aar` files, place in `android/libs/` and reference via Gradle.
For `.xcframework`/`.framework`, place in `ios/` and use `vendored_frameworks` in the podspec.

---

## Common Mistakes to Avoid

- **Forgetting `prebuild --clean`** after adding native dependencies or changing native code structure.
- **Not running `npm run build`** for TypeScript compilation before testing.
- **Mismatched module names** between `Name("X")` in native code and `requireNativeModule('X')` in TS.
- **Not declaring events** before emitting them. Always use `Events("eventName")` in the definition.
- **Returning non-serializable types** from native functions. Stick to primitives, arrays, maps, Records, and Enumerables.
- **Using `requireNativeModule` for views** — views use `requireNativeViewManager` instead.
- **Forgetting to handle layout** for native views — on Android set `LayoutParams`, on iOS override `layoutSubviews`.

---

## Reference Files

Read these for detailed, step-by-step implementation guides with full code examples:

- `references/native-module.md` — Functions, events, enums, persistence (SharedPreferences / UserDefaults)
- `references/native-view.md` — Native UI components, props, view events, layout
- `references/config-plugin.md` — Config plugins, AndroidManifest/Info.plist injection, reading native config
- `references/third-party-library.md` — Wrapping existing Android/iOS libraries, native dependencies
- `references/standalone-module.md` — Monorepo setup, npm publishing, using modules across projects
