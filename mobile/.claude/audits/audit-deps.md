# Dependencies Audit — 2026-07-08

> **Update 2026-07-08:** `axios` bumped `1.13.2` → `1.18.1` to clear all axios security
> advisories. Verified: `tsc --noEmit` passes and `expo install --check` does not flag axios
> (Expo imposes no version constraint on it). See **Security Advisories (npm audit)** below.

## Summary

Overall dependency health is **good**. The project is on Expo SDK 54 and nearly every
package is correctly aligned to that SDK's compatibility matrix — `expo install --check`
reports only a single mismatch (`typescript`). There is no mixed-package-manager risk
(single committed `package-lock.json`, no `yarn.lock`/`pnpm-lock.yaml`), and the dependency
surface is small and modern (React 19, RN 0.81, New Architecture enabled).

The main risks are low-severity:
1. **One unused dependency** (`expo-symbols`) — the `components/ui/IconSymbol` component it
   backed no longer exists; icons are now rendered via `@expo/vector-icons`.
2. **One Expo-flagged mismatch** — `typescript@5.8.3` should be `~5.9.2` for SDK 54.
3. **A batch of safe minor updates** for non-Expo-managed libraries.

Critically, several packages show a "latest" that is a **major version ahead** (async-storage
3.x, gesture-handler 3.x, react-native 0.86, and every `expo-*` at 57.x). These belong to
**newer Expo SDKs (55/56/57)** and must **not** be upgraded piecemeal — they are managed by
`expo install` and are only safe to move as part of a full SDK upgrade.

## Expo SDK Compatibility Issues

Only one true mismatch, confirmed via `npx expo install --check`:

| Package | Current | Expected (SDK 54) | Action |
|---|---|---|---|
| `typescript` | 5.8.3 | ~5.9.2 | Run `npx expo install typescript` |

Everything else (`expo-*`, `react-native-*`, `@react-navigation/*`, `react`, `react-dom`)
is correctly pinned to SDK 54's matrix. All native modules in use are Expo-managed with
autolinking — no manual linking required. `expo-dev-client` is present, so custom native
modules work; this project has none that break Expo Go beyond the standard set.

> **Do NOT independently bump these** — their "latest" belongs to SDK 55/56/57 and will
> break against RN 0.81 / SDK 54:
> - `@react-native-async-storage/async-storage` 2.2.0 → (latest 3.1.1)
> - `react-native-gesture-handler` 2.28.0 → (latest 3.0.2)
> - `react-native` 0.81.5 → (latest 0.86.0)
> - `react-native-screens` 4.16.0 → (latest 4.25.2)
> - `react-native-safe-area-context` 5.6.2 → (latest 5.8.0)
> - `react-native-reanimated` 4.1.6 → (latest 4.5.1)
> - all `expo-*` packages (latest 57.x)
> - `react` / `react-dom` 19.1.0 → (latest 19.2.7)
>
> Move all of these together via `npx expo install --fix` **only** when doing a deliberate
> SDK upgrade.

## Significantly Outdated Packages

No **directly-usable** package is more than one major version behind. The major-version
gaps that `npm outdated` reports are all Expo-managed (see the box above) or dev tooling
that intentionally lags:

| Package | Current | Latest | Note |
|---|---|---|---|
| `eslint` | 9.39.2 | 10.6.0 | Hold — `eslint-config-expo@10` targets ESLint 9. Bump only with the config. |
| `eslint-config-expo` | 10.0.0 | 57.0.0 | Managed by SDK; upgrade with the SDK, not standalone. |
| `typescript` | 5.8.3 | 7.0.2 | Take the SDK-expected `~5.9.2`, **not** 7.x (breaking + unsupported by SDK 54). |

## Unused / Redundant Dependencies

| Package | Verdict | Evidence |
|---|---|---|
| `expo-symbols` | **Remove** | Zero imports across the codebase; no `SymbolView`/`IconSymbol` usage. The `components/ui/` folder referenced in CLAUDE.md no longer exists — icons come from `@expo/vector-icons` (`ThemedIcon`, `@/components/themed-icon`). |
| `expo-status-bar` | **Likely removable** | No `StatusBar` / `expo-status-bar` import found in `app/`, `components/`, etc. Standard in the Expo template but currently unreferenced. Verify no reliance via a default layout before removing. |

No redundant/duplicate-functionality packages found (single HTTP client `axios`, single
state lib `zustand`, single immutability lib `immer`, no competing date libraries).

Packages that appear "unimported" but are **legitimately required** (do not remove):
- `expo-linking` — peer/transitive requirement of `expo-router` (deep linking).
- `react-native-web` + `react-dom` — required for the web target (`app.json` `web.output: "static"`).
- `react-native-screens`, `react-native-safe-area-context` — required by React Navigation.
- `expo-splash-screen` — configured as a plugin in `app.json`.
- `expo-dev-client` — dev tooling; correctly in `devDependencies`.

## Deprecated / Unmaintained Packages

None detected. All dependencies are actively maintained:
- `sonner-native`, `react-native-draggable-flatlist`, `react-hook-form`, `zustand`,
  `immer`, `@tanstack/react-query`, `axios` all have recent releases and healthy ecosystems.
- No packages flagged as deprecated in the lock file resolution.

## Bundle Size Concerns

No significant concerns for an app this size.
- `axios` (~13 kB gz) is used for auth requests; acceptable, though the built-in `fetch` +
  a thin wrapper could remove it entirely if you want to trim one dependency. Low priority.
- `@expo/vector-icons` bundles many icon fonts, but only `Ionicons` is imported — Expo/Metro
  ships only the referenced font, so no action needed.
- `react-native-reanimated` and `react-native-gesture-handler` are heavy but justified
  (drag-and-drop lists via `react-native-draggable-flatlist`, used in `edit-list.tsx`).

## Minor Updates Available

Low-risk, non-Expo-managed updates safe to batch in one PR (`npm update` within semver, or
targeted installs). None cross a major boundary:

| Package | Current | Wanted/Latest |
|---|---|---|
| `@expo/vector-icons` | 15.0.3 | 15.1.1 |
| `@react-navigation/bottom-tabs` | 7.9.0 | 7.18.8 |
| `@react-navigation/elements` | 2.9.3 | 2.9.30 |
| `@react-navigation/native` | 7.1.26 | 7.3.8 |
| `@tanstack/react-query` | 5.90.12 | 5.101.2 |
| `react-hook-form` | 7.69.0 | 7.81.0 |
| `immer` | 11.1.4 | 11.1.11 |
| `zustand` | 5.0.12 | 5.0.14 |

> Note: React Navigation packages are part of the Expo SDK 54 matrix but their patch/minor
> range is flexible. Prefer `npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/elements`
> so Expo picks SDK-safe versions rather than a blind `npm update`.

## Security Advisories (npm audit)

`npm audit` initially reported **29 advisories (1 critical, 6 high, 21 moderate, 1 low)**.
The count is misleading: only **one** affected a package that ships in the app bundle.

### Shipped / runtime — FIXED
| Package | Was | Now | Advisories |
|---|---|---|---|
| `axios` (direct dep) | 1.13.2 | **1.18.1** ✅ | Prototype-pollution gadgets, SSRF/`no_proxy` bypass, `Proxy-Authorization` leak on redirect, ReDoS, CRLF injection — all cleared. Not Expo-managed, so a free minor bump; verified compatible. |

### Build / dev tooling only — accepted risk
All remaining advisories are **transitive** dependencies of the Expo CLI, Metro bundler,
React Native, and the ESLint/Jest toolchain. They run on the developer machine / CI during
`expo start`, prebuild, and bundling — they are **not** part of the JS bundle users download,
so exploit surface is minimal for a mobile app.

- `@babel/core`, `postcss`, `@expo/metro-config` → under `expo` / `@expo/cli`
- `shell-quote` ("critical"), `undici`, `ws`, `tar`, `follow-redirects`, `form-data`,
  `fast-uri`, `brace-expansion` → build/transport tooling
- `js-yaml` → under Jest's `@istanbuljs/load-nyc-config`
- `@xmldom/xmldom`, `uuid`, `xcode` → under `@expo/config-plugins` / prebuild
- `expo-*` chain (`expo-constants`, `expo-asset`, `expo-linking`, `expo-router`,
  `expo-manifests`, `expo-dev-client`, `expo-splash-screen`) → all constrained by SDK 54 pins

### ⚠️ Do NOT run `npm audit fix --force`
Plain `npm audit fix` cannot resolve the transitive advisories — they are locked behind
Expo's pinned versions (a dry-run leaves the count unchanged). The only automatic remedy is
`--force`, which **installs `expo@57`** — a full SDK 54→57 **breaking migration**. Silencing
build-time advisories is not a valid reason to force that. The correct path is a deliberate
SDK upgrade via `npx expo install --fix`, which clears this whole chain as a batch.

## Recommendations

Ordered by priority:

1. ✅ **DONE — `axios` upgraded to 1.18.1**, clearing all shipped security advisories.
2. ✅ **DONE — SDK 54 patch drift aligned.** Ran `npx expo install` for `expo` (→54.0.35),
   `expo-constants` (→18.0.13), `expo-font` (→14.0.12), `expo-linking` (→8.0.12),
   `expo-router` (→6.0.24), `expo-dev-client` (→6.0.21), and `typescript` (→5.9.2).
   `expo install --check` now reports **"Dependencies are up to date"** and `tsc --noEmit` passes.
   Notes: (a) `expo install` tried to add the optional `expo-font` config plugin to the
   dynamic `app.config.ts` and errored — intentionally skipped (fonts already load at runtime
   without it). (b) It also duplicated `expo-dev-client`/`typescript` into `dependencies`;
   these were moved back to `devDependencies` where they belong.
3. **Remove `expo-symbols`** — confirmed unused: `npm uninstall expo-symbols`.
4. **Verify then remove `expo-status-bar`** if no default layout depends on it:
   `npm uninstall expo-status-bar` (double-check web/native status bar rendering after).
5. **Batch the safe minor updates** listed above. Use `npx expo install` for the
   `@react-navigation/*` and `@expo/vector-icons` packages; `zustand`, `immer`,
   `react-hook-form`, and `@tanstack/react-query` can go via `npm install <pkg>@latest`.
6. **Do NOT** run `npm update` broadly, `npm audit fix --force`, or bump the
   major-version-behind packages (async-storage, gesture-handler, react-native, screens,
   safe-area-context, reanimated, all `expo-*`, react/react-dom). These are SDK-locked —
   upgrade them only as part of a planned Expo SDK 55→57 migration via `npx expo install --fix`.
7. **Hold ESLint at 9.x** until `eslint-config-expo` moves to ESLint 10 (upgrade the SDK's
   config, not ESLint standalone).
8. **Optional cleanup:** consider dropping `axios` in favor of `fetch` to shed one dependency
   — low priority, only if simplifying the auth layer.

### Lock File Health
- ✅ Single lock file (`package-lock.json`) committed and tracked by git.
- ✅ No competing `yarn.lock` / `pnpm-lock.yaml` — no mixed-package-manager risk.
