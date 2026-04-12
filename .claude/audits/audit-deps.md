# Dependencies Audit — 2026-04-11

## Summary

The dependency tree is generally healthy for an early-stage Expo SDK 54 project. Most Expo-ecosystem packages are on their correct SDK-54-aligned versions. The primary risks are: (1) a **missing declared dependency** (`expo-image-picker` is imported in source but absent from `package.json`), (2) five packages installed but **never imported** in source (`expo-checkbox`, `expo-image`, `expo-web-browser`, `expo-haptics`, `expo-system-ui`), (3) `react-native-worklets` is a transitive peer dependency of Reanimated 4 that should **not be declared directly**, (4) `react-native` is at `0.81.5` while Expo SDK 54 targets `0.79.x`, (5) `typescript` is pinned to `~5.9.2` which does not exist as a stable release, and (6) `expo-dev-client` belongs in `devDependencies`.

---

## Expo SDK Compatibility Issues

| Package | Declared | Expo SDK 54 expected | Status |
|---|---|---|---|
| `react` | `19.1.0` | `19.0.0` | Slightly ahead — likely fine but unvalidated by Expo at SDK 54 release |
| `react-native` | `0.81.5` | `0.79.x` | **Significantly ahead** — SDK 54 was built against RN 0.79. Native module ABI mismatch risk. |
| `react-native-reanimated` | `~4.1.1` | `~3.17.x` | **Major version ahead** — intentional upgrade to Reanimated 4 (New Architecture aligned), but must be used consistently with `react-native-worklets` |
| `react-native-gesture-handler` | `~2.28.0` | `~2.22.x` | Minor version ahead — safe |
| `react-native-screens` | `~4.16.0` | `~4.4.x` | Minor version ahead — safe |
| `react-native-safe-area-context` | `~5.6.0` | `~5.3.x` | Minor version ahead — safe |

**Key concern — `react-native@0.81.5` vs `0.79.x`:** Expo SDK 54's native modules (`expo-modules-core`) are compiled against the RN 0.79 C++ ABI. Running 0.81.5 risks native build failures or runtime crashes. Either pin to the Expo-blessed version via `npx expo install react-native`, or upgrade to Expo SDK 55+.

**`react-native-worklets@0.5.1`:** This is an internal peer dependency of Reanimated 4. It should not be declared directly in `package.json` — doing so risks version drift when Reanimated updates. Remove the direct declaration.

---

## Significantly Outdated Packages

**✅ `typescript ~5.9.2`** — Changed to `~5.8.0`.

No other packages are significantly behind a stable major release.

---

## Unused / Redundant Dependencies

Verified by grepping all `.ts`/`.tsx` source files outside `node_modules`:

| Package | Declared | Finding |
|---|---|---|
| ✅ `expo-checkbox` | Removed |
| ✅ `expo-image` | Removed |
| ✅ `expo-web-browser` | Removed |
| ✅ `expo-haptics` | Removed |
| ✅ `expo-system-ui` | Removed — confirmed not used as a config plugin |
| ✅ `react-native-worklets` | Removed |

**Missing declared dependency:**

| Package | Status |
|---|---|
| ✅ `expo-image-picker` | Resolved — `components/image-picker.tsx` was unused and deleted entirely. |

---

## Deprecated / Unmaintained Packages

No packages are deprecated or abandoned. All major dependencies are actively maintained.

**`react-native-draggable-flatlist@^4.0.3`** — Not an Expo-managed package. New Architecture (Fabric) compatibility is unconfirmed for v4. Release cadence has slowed. Flag for future review if New Architecture becomes a requirement. Fallback candidates: `react-native-reorderable-list` (confirmed New Architecture support).

---

## Bundle Size Concerns

**`axios` (~50 KB gzipped):** Used for the API client with interceptor-based token refresh. Justified for now. If web bundle size becomes a concern, the native `fetch` API or a micro-library like `ky` could replace it. Low priority for React Native.

**`@expo/vector-icons`:** Bundles multiple full icon font sets. Used in 5 source files. Ensure imports are set-specific (e.g., `import { Ionicons } from '@expo/vector-icons'`) rather than pulling from the barrel to ensure tree-shaking removes unused font sets.

**`@tanstack/react-query`:** Only `useMutation` is called (for auth login/signup). `QueryClientProvider` is set up in the root layout. This is fine given planned backend integration — no action needed.

No heavy libraries like moment.js or lodash are present.

---

## Minor Updates Available

| Package | Notes |
|---|---|
| `react-hook-form` | `^7.69.0` — track latest 7.x |
| `immer` | `^11.1.4` — track latest 11.x |
| `zustand` | `^5.0.12` — track latest 5.x |
| `sonner-native` | `^0.22.2` — early-stage library; watch for breaking changes on each release |
| `eslint` | `^9.25.0` — track latest 9.x |
| `@types/react` | `~19.1.0` — keep aligned with `react` version |

---

## React Native Specific

**New Architecture readiness:**
- `react-native-reanimated` 4 — New Architecture native
- `react-native-gesture-handler` 2.28 — New Architecture supported
- `@react-native-async-storage/async-storage` 2.x — New Architecture supported
- `react-native-draggable-flatlist` 4.x — New Architecture status **unconfirmed** — test before enabling Fabric
- All `expo-*` packages at SDK 54 versions — New Architecture compatible

**Expo Go compatibility:** `expo-secure-store` requires a custom dev client (not Expo Go). `expo-dev-client` being installed covers this, but the team should not be testing with standard Expo Go.

**Manual linking:** Zero packages require manual linking. Expo autolinking handles everything.

---

## Lock File Health

- `package-lock.json` present, lock file version 3 (npm 7+). Good.
- No `yarn.lock` or `bun.lockb`. No mixed package manager risk.
- Lock file is consistent with `package.json`.

---

## Recommendations

Ordered by priority:

1. ✅ **Missing dependency resolved** — `components/image-picker.tsx` deleted (unused).

2. **Resolve the react-native version mismatch** — `0.81.5` vs Expo SDK 54's `0.79.x` is the highest-risk issue. Run `npx expo install react-native` to pin to the Expo-blessed version, or upgrade to Expo SDK 55+.

3. **Fix the TypeScript version** — Change `"typescript": "~5.9.2"` to `"typescript": "~5.8.0"` (latest stable).

4. ✅ **Remove unused packages** — Removed: expo-checkbox, expo-image, expo-web-browser, expo-haptics, react-native-worklets, expo-system-ui.

5. ✅ **Move `expo-dev-client` to devDependencies** — Moved.

6. **Run `npx expo install --fix`** — After the above changes, let Expo reconcile all `expo-*` and `react-native-*` packages to their SDK-54-blessed versions.

7. **Verify `expo-system-ui` plugin usage** — Check `app.config.ts` for a registered plugin entry. Remove the package if absent.

8. **Test `react-native-draggable-flatlist` on New Architecture** — Before enabling Fabric in your Expo config, validate drag-and-drop works. Have a replacement plan if it is incompatible.

9. **Ensure vector-icons imports are set-specific** — Import from `'@expo/vector-icons/Ionicons'` (or whichever set) rather than the package barrel.
