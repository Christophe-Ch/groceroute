# Architecture Audit — 2026-04-11

## Summary

Groceroute is a small, early-stage app with a clean foundation. The directory layout is logical, the theming system is well-structured, and the Zustand store is appropriately minimal for the current scope. Most architectural decisions are sound.

The primary issues are: (1) a dual ID-generation scheme that will break under concurrent writes or future multi-device sync; (2) a `PlayList` component that holds a private, diverged copy of list state — creating a synchronisation gap with the store; (3) a `GroceryItem.quantity` field typed as `string` but initialised with a number literal; (4) several theming inconsistencies where raw `useColorScheme` calls bypass the design-token system; and (5) a `GestureHandlerRootView` nested inside every `ListCard`, which is an API misuse. These are concrete, fixable problems rather than systemic failures.

---

## Structural Issues

**1. `app/index.tsx` — unconditional redirect bypasses auth gate**

The root entry point unconditionally redirects to `/(app)/(tabs)/lists` regardless of auth state. The `(auth)` group exists but is never entered via redirection. Auth is structurally present (`AuthContext`, `tokenService`, login/signup screens) but not enforced at any navigation boundary.

Should be: The `(app)` layout (currently missing — there is no `app/(app)/_layout.tsx`) should read `AuthContext.token` and redirect to `/(auth)/login` when no token is present.

---

**2. `components/image-picker.tsx` — unused component, missing dependency**

`ImagePicker` is not referenced anywhere. It imports `expo-image-picker`, which is not listed in `package.json`. If used, it would crash at runtime.

Should be: Remove until needed. Add `expo-image-picker` as a dependency when reintroduced.

---

**3. `components/ui/icon-symbol.tsx` / `icon-symbol.ios.tsx` — dead scaffolding**

Neither file is imported anywhere. They were left from the Expo template.

Should be: Delete both files.

---

**4. `components/list/list-card/index.tsx` — trivial barrel export adds indirection**

The `index.tsx` is a single line: `export { default } from "./list-card"`. At two files, this is premature structure. The pattern — separate file + barrel + named component file — is the worst combination.

Should be: Either rename `list-card.tsx` to `index.tsx`, or accept the barrel and leave it. Don't do both.

---

**5. `constants/theme.ts` — no exported `ColorKey` type**

`useThemeColor` repeats `keyof typeof Colors.light & keyof typeof Colors.dark` inline. There is no reusable `ColorKey` alias.

Should be: `export type ColorKey = keyof typeof Colors.light` and use it in `use-theme-color.ts` and any other file that references color names.

---

## State Management Issues

**6. ✅ `store/grocery-list.store.ts` — `Date.now()` IDs are collision-prone**

`"list-" + Date.now()` and `"item-" + Date.now()` are millisecond-resolution. Two rapid additions in the same millisecond silently overwrite each other. This also won't survive backend sync (server will reject non-UUID IDs).

Should be: `crypto.randomUUID()` (available in Hermes ≥ 0.70 and all modern runtimes) or `expo-crypto`'s `randomUUID()`.

---

**7. ✅ `store/grocery-list.store.ts` — `updateList` re-reads store after mutation**

```ts
set(produce((s) => { s.lists[id] = { ...s.lists[id], ...updatedFields }; }));
await storageService.persistList(get().lists[id]); // re-reads from store
```

All other actions compute the value in scope and pass it directly. `updateList` alone does a post-mutation `get()`, which is inconsistent and fragile if middleware makes `set` async.

Should be: Compute the merged value before calling `set`, then persist that local value.

---

**8. `store/grocery-list.store.ts` — no error handling on any async action**

Every `storageService` call is fire-and-forget. If AsyncStorage fails, in-memory state and persisted state diverge silently. The user sees an update that vanishes on next launch.

Should be: Wrap each `storageService` call in try/catch and surface failures via `toast.error()`. This is acknowledged in `CLAUDE.md` but should be fixed before backend integration is added.

---

**9. `lists/index.tsx` — list display order is non-deterministic**

`Object.values(lists).map(...)` renders lists in insertion order of a `Record<string, GroceryList>`. After hydration from AsyncStorage the order follows the `lists:index` array, which could differ from creation order.

Should be: Sort with a `useMemo` selector: `Object.values(lists).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())`.

---

**10. `GroceryList.pastItems` — stale IDs and per-list scope limit autocomplete**

`pastItems` stores full `GroceryItem` objects including their `id` from the original list context. When an item is re-added via `addPastItem`, the stale ID is pushed back into `items`, potentially colliding with a freshly created item. Autocomplete is siloed per list so items from "List A" never suggest in "List B".

Should be: Either (a) move past items to a global history store, or (b) type `pastItems` as `{ name: string; quantity: string }[]` to make the semantics explicit and eliminate the stale-ID problem.

---

## Component Design Issues

**11. `components/list/play-list.tsx` — local state shadow diverges from the store**

```ts
const [list, setList] = useState(baseList);
```

`PlayList` takes a snapshot of the store at mount and applies check changes only locally. If the user backgrounds and restores the app, all check progress is lost. The `item.checked` field on `GroceryItem` in the store is never written during a shopping session — making it a dead field.

Should be: Decide on one approach. If checked state is ephemeral (recommended), keep it fully local and remove `GroceryItem.checked` from the model (or clearly document it as unused in play mode). If it must survive app restarts, drive it through store actions.

---

**12. `components/item/edit-item-row.tsx` — dual-mode component with entangled branches**

`EditItemRow` serves two distinct roles depending on whether `item` is provided:
- **Add mode** (no `item`): freeform input, autocomplete, resets after submit.
- **Edit mode** (with `item`): name + quantity fields, inline delete.

Both modes share one `focused` state, one `name` state, and one `onChangeText` handler containing a conditional. Props like `pastItems` and `currentItemIds` are only meaningful in add mode but sit on the shared interface. `onSetQuantity` is defined unconditionally but only reachable in edit mode.

Should be: Split into `AddItemRow` and `EditItemRow`. Shared layout styles go in a `item-row.styles.ts`.

---

**13. ✅ `components/list/list-card/list-card.tsx` — nested `GestureHandlerRootView`**

```tsx
<GestureHandlerRootView>
  <Swipeable ...>
```

`GestureHandlerRootView` must be a **singleton at the app root**. It is already correctly placed in `app/_layout.tsx`. Nesting it inside every rendered `ListCard` creates redundant gesture context trees and can cause gesture conflicts.

Should be: Remove `GestureHandlerRootView` from `list-card.tsx`. `Swipeable` works under the root-level `GestureHandlerRootView`.

---

**14. `components/themed-icon.tsx` — bypasses the theming system**

`ThemedIcon` uses `useColorScheme` directly from `react-native` (not the web-aware wrapper) and hardcodes fallback colours as raw hex (`"#000000"`, `"#ffffff"`). Every other `themed-*` component uses `useThemeColor`. The actual design-system icon colours are `Colors.light.icon = "#687076"` and `Colors.dark.icon = "#9BA1A6"` — both different from the hardcoded fallbacks.

Should be: Replace internals with `useThemeColor({}, "icon")` as the default. Remove `lightColor` / `darkColor` props to match the rest of the theming surface.

---

**15. `components/themed-input.tsx` — `renderInput` inner function**

`renderInput` is a plain function defined inside the component body, recreated on every render, and called with positional arguments `(value?, onChangeText?, onBlur?, onFocus?)`. The positional signature is harder to read and extend than named props.

Should be: Inline the two call sites or extract to named props. The inner function adds complexity without benefit.

---

## Routing Issues

**16. `(auth)` group is unreachable — no route guard exists**

Described in structural issue #1. The `(app)` group has no `_layout.tsx` to enforce auth. The `(auth)` screens can only be reached by the developer navigating directly to them.

Should be: Create `app/(app)/_layout.tsx` that reads `AuthContext` and redirects unauthenticated users to `/(auth)/login`.

---

**17. `AppLayout` renders the full tab tree before hydration completes**

`app/(app)/(tabs)/_layout.tsx` triggers hydration but renders `<Tabs>` immediately, requiring every child screen to independently check `hydrated`. The current `lists/index.tsx` has this guard; any future screen must remember to add it.

Should be: Render `null` or a `<LoadingScreen />` in `AppLayout` until `hydrated` is true. This centralises the gate.

---

**18. `app/index.tsx` hard-codes a deep path**

`<Redirect href="/(app)/(tabs)/lists" />` is brittle. Renaming any segment silently breaks the redirect.

Should be: Redirect to `/(app)` and let the tabs layout select the default tab, or use Expo Router's typed route constants.

---

**19. Dead `StyleSheet` entries in auth screens**

`app/(auth)/login.tsx` and `app/(auth)/signup.tsx` both define `styles.title` and `styles.subtitle` that are never applied. These are template leftovers.

Should be: Delete the unreferenced style entries.

---

## Patterns & Consistency Issues

**20. Two different `useColorScheme` sources**

`ThemedIcon` imports from `react-native` directly; every other file uses the wrapper at `hooks/ui/use-color-scheme` (which has a `.web.ts` variant handling SSR hydration). On first web render, `ThemedIcon` will show the wrong colour.

**21. ✅ `GroceryItem.quantity` type vs. initialisation mismatch**

`GroceryItem.quantity` is declared as `string`. `addItem` in the store initialises it as `quantity: 1` (a number literal). TypeScript in strict mode should flag this. At runtime, the number coerces wherever it is rendered as text, but `updateItem` callers passing `{ quantity: "2 kg" }` will produce a mixed `string | number` field in storage. The reset in `PlayList` uses `draft.quantity = ""` (a string). The type needs to be settled.

**22. Error handling is inconsistent across the two data flows**

Auth mutations (`login`, `signup`) are wrapped in try/catch with `toast.error()`. Grocery store mutations have no error handling. When the backend is connected to the grocery flow, failures will be invisible.

**23. `tokenService` supports only one subscriber**

`subscribeToken` silently replaces any existing listener. A second caller (e.g., a middleware or analytics hook) would silently break `AuthContext`'s token tracking.

Should be: Use an array of listeners, or remove `subscribeToken` and rely entirely on `AuthContext` for reactive token state (it already does `getAccessToken()` on mount).

**24. `PlayList` sorts items on every render without memoisation**

```ts
const items = [...list.items].sort((a, b) => +a.checked - +b.checked);
```

This creates a new array and sorts it on every render, including every check-toggle. Should be `useMemo`.

---

## Recommendations

Ordered by architectural impact, highest first.

1. **Implement the auth route guard** (issues #1, #16) — Create `app/(app)/_layout.tsx` with an `AuthContext`-based redirect. This is the most significant gap.

2. ✅ **Fix ID generation** (issue #6) — Replace `Date.now()` with `crypto.randomUUID()`. One-line change per call site.

3. **Centralise the hydration guard** (issue #17) — Render nothing in `AppLayout` until `hydrated`. Removes per-screen guard duplication.

4. **Split `EditItemRow`** (issue #12) — Two focused, single-responsibility components instead of one dual-mode component.

5. ✅ **Remove `GestureHandlerRootView` from `ListCard`** (issue #13) — Delete three lines. Fixes an API misuse.

6. **Fix `ThemedIcon`** (issues #14, #20) — Replace with `useThemeColor({}, "icon")`. Aligns with the rest of the theming system.

7. **Add error handling to store actions** (issue #8) — try/catch + `toast.error()` pattern before backend integration.

8. **Resolve `PlayList` state divergence** (issue #11) — Pick one authoritative source for checked state and stick to it.

9. **Fix `quantity` type inconsistency** (issue #21) — Unify declaration and initialisation.

10. **Clarify `pastItems` semantics** (issue #10) — Move to a global history store or downtype to `{ name: string; quantity: string }[]`.

11. ✅ **Fix `updateList` post-mutation `get()`** (issue #7) — Minor correctness improvement: compute the merged value before `set`.

12. **Remove dead code** (issues #2, #3, #19) — Delete `ImagePicker`, both `IconSymbol` files, and dead style entries in auth screens.
