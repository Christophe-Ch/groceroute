# Full Audit Summary — 2026-04-11

## Overall Health Score

| Domain       | Grade | Top Finding |
|--------------|-------|-------------|
| Architecture | C+    | No auth guard — `app/index.tsx` unconditionally redirects all users into the protected app segment |
| Dependencies | B     | `react-native@0.81.5` vs Expo SDK 54's expected `0.79.x`; missing `expo-image-picker` declaration |
| Performance  | C     | Broad Zustand subscriptions + un-memoized list items cause cascading re-renders on every store mutation |
| Security     | C+    | Auth guard absent; raw access token stored in React state; token refresh can loop infinitely |
| TypeScript   | B-    | `quantity` typed `string` but assigned `number 1`; 4 runtime-crash risks from unguarded `!` and unguarded map lookups |

---

## Cross-Cutting Themes

**1. Missing auth enforcement** — Three separate audits (Architecture, Security, TypeScript) independently flagged that `app/index.tsx` unconditionally redirects to `/(app)/(tabs)/lists`. No `_layout.tsx` file exists for the `(app)` segment to enforce an auth check. The `(auth)` screens are effectively unreachable via normal app flow.

**2. `Date.now()` IDs are unsafe** — Both Architecture and Security audits flagged `"list-" + Date.now()` and `"item-" + Date.now()`. These produce colliding IDs on rapid creation, will be rejected by any future backend, and represent a data-loss risk in the current offline-first store.

**3. `GestureHandlerRootView` misuse** — Architecture and Performance audits both independently caught a `GestureHandlerRootView` nested inside every `ListCard`, when the API requires a single instance at the tree root (already present in `app/_layout.tsx`). This causes redundant context trees that scale with list count.

**4. No error handling on store async actions** — Architecture, TypeScript, and Performance audits all converged on the fact that every `storageService` call is fire-and-forget. Silent AsyncStorage failures cause in-memory/persisted state divergence with no user feedback.

---

## Top 10 Priority Actions

Ordered by cross-domain impact.

| # | Domain | Location | What to Fix |
|---|--------|----------|-------------|
| 1 | Security + Arch | `app/(app)/_layout.tsx` (create it) | Add an auth guard that reads `AuthContext` and redirects unauthenticated users to `/(auth)/login` before any protected content renders |
| 2 | ✅ Security + Arch | `store/grocery-list.store.ts:40,86` | Replace `Date.now()` IDs with `crypto.randomUUID()` — prevents data collision and enables future backend sync |
| 3 | ✅ Arch + Perf | `components/list/list-card/list-card.tsx:23` | Remove `GestureHandlerRootView` from `ListCard` — it is already at the app root; nested copies cause gesture conflicts and mount overhead |
| 4 | ✅ TypeScript | `store/grocery-list.store.ts:88` | Fix `quantity: 1` → `quantity: ""` — type mismatch between the model (`string`) and initialisation (`number`) |
| 5 | ✅ TypeScript + Arch | `store/grocery-list.store.ts` (6 call sites) | Guard `get().lists[id]` before passing to `persistList` — `undefined` dereference crash when a listId is absent |
| ✅ 6 | Perf | `app/(app)/(tabs)/lists/index.tsx:14`, `[listId].tsx:16` | Fix Zustand selectors to subscribe to the minimal slice — eliminates store-wide re-renders on every mutation |
| 7 | Security | `contexts/authContext.tsx` | Replace `token: string \| null` in context with `isAuthenticated: boolean` — removes the raw token from React state/DevTools |
| 8 | Perf | `services/storage.service.ts:22–32` | Debounce `updateItem` storage writes and separate index registration from data write — eliminates 40–80 ms I/O per keystroke |
| ✅ 9 | TypeScript | `components/list/play-list.tsx:55`, `edit-item-row.tsx:62` | Replace `!` non-null assertions with guards — both are runtime crash risks on valid user interactions |
| 10 | Deps | `package.json` | Run `npx expo install react-native` to realign to `0.79.x`; add `expo-image-picker`; remove 5 unused packages (`expo-checkbox`, `expo-image`, `expo-web-browser`, `expo-haptics`, `react-native-worklets`) |

---

## Per-Domain Summaries

**Architecture** — The project has a clean, well-layered foundation for its size. The most critical gap is the absent auth guard: `app/index.tsx` always redirects into the protected app segment, meaning `(auth)` screens are structurally unreachable. `PlayList` maintains a private copy of list state that diverges from the store on app backgrounding, making `GroceryItem.checked` effectively a dead field. `EditItemRow` serves two conflicting roles (add vs. edit mode) through entangled shared state, and should be split into two components. A `GestureHandlerRootView` nested inside each `ListCard` is an API misuse — only one is needed at the app root.

**Dependencies** — The dependency tree is in good shape overall. The only high-severity issue is `react-native@0.81.5` running against Expo SDK 54's `0.79.x` ABI, which risks native build or runtime failures. `expo-image-picker` is imported in source but absent from `package.json` — a silent accidental transitive dependency. Five packages are installed but never imported and should be removed. `typescript@~5.9.2` resolves to a non-existent stable version and should be pinned to `~5.8.0`.

**Performance** — The most impactful issues are architectural: full-store Zustand subscriptions in `Index`, `ListScreen`, and `AppLayout` cause every store mutation to cascade re-renders across the entire tree. Combined with un-memoized `ListCard`, `EditItemRow`, and `PlayItemRow`, any item edit re-renders every visible row. `persistList` writes to AsyncStorage on every keystroke with no debounce. The `ScrollView` in the lists overview mounts all cards simultaneously instead of using windowed FlatList rendering. A correctness bug in `PlayList` mutates a Set in-place and may silently suppress UI updates.

**Security** — Tokens are correctly stored in `expo-secure-store` (a meaningful positive). The auth guard absence is the most structurally significant issue: there is no layout that checks auth state before rendering protected content. The raw access token string is unnecessarily propagated through React Context and state, making it visible in DevTools. The axios token-refresh interceptor can loop if the refresh endpoint returns 401 — the `_retry` flag is not applied to the refresh request itself. The deep link scheme remains the Expo template default (`reactnativetemplate`), creating potential URI hijacking exposure on Android.

**TypeScript** — Strict mode is on, which is the right foundation. The most serious issue is `quantity: 1` (number) assigned to a field typed `string`, which TypeScript misses due to the outer type annotation broadening. Six call sites pass `get().lists[id]` to `persistList` without a guard — if the ID is absent, `persistList` receives `undefined` and crashes. Two `!` non-null assertions on `find` results and optional props are runtime crash risks. The `Control<any, any, any>` typing in `ThemedInput` and `ImagePicker` completely disables form field type-checking. Date fields round-trip through JSON as `string`, but the model declares them as `Date`.
