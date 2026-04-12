# Performance Audit — 2026-04-11

## Summary

The app is small enough that most issues are latent rather than immediately catastrophic, but several patterns will cause measurable jank on mid-range Android devices as list sizes grow. The highest-impact areas are: **(1) broad Zustand subscriptions** that re-render the entire lists screen and list-detail screen on every store mutation, **(2) un-memoized list-item components** combined with inline callbacks passed to FlatList/DraggableFlatList, **(3) `GestureHandlerRootView` placed inside each list card** (one per card) instead of only at the tree root, and **(4) `persistList` doing a serial read+write on every keystroke** in item name/quantity fields.

---

## Re-render Issues

**✅ 1. `ListScreen` subscribes to the entire `lists` map** — `app/(app)/(tabs)/lists/[listId].tsx:16–17`. `const { lists, updateList } = useGroceryListStore()` subscribes to the whole store object. Any mutation to any list causes `ListScreen` to re-render even though only one list (`lists[listId]`) is consumed. Fix: `const list = useGroceryListStore((s) => s.lists[listId])`.

**✅ 2. `Index` calls `Object.values(lists)` inline** — `app/(app)/(tabs)/lists/index.tsx:14,26,45`. `Object.values(lists)` creates a new array every render. Combined with a full-store subscription, every store mutation (including item checks in a different screen) re-renders the lists index. Fix: `useShallow((s) => Object.values(s.lists))` from `zustand/react/shallow`.

**✅ 3. `ListCard` is not memoized** — `components/list/list-card/list-card.tsx:14`. Renders inside the `.map()` in `Index`; not wrapped in `React.memo`, so it re-renders on every parent re-render even when its `list` prop is unchanged. Fix: `export default React.memo(ListCard)`.

**✅ 4. `EditItemRow` and `PlayItemRow` not memoized** — `components/item/edit-item-row.tsx:18`, `components/item/play-item-row.tsx:14`. Both used as `renderItem`; any parent re-render re-renders all visible rows simultaneously. Fix: `React.memo` on both.

**✅ 5. `AppLayout` subscribes to full store for two scalar values** — `app/(app)/(tabs)/_layout.tsx:10`. After hydration, every future store mutation re-renders the tab layout tree. Fix: `const hydrated = useGroceryListStore((s) => s.hydrated); const hydrate = useGroceryListStore((s) => s.hydrate)`.

**6. `AuthContext` value object constructed inline** — `contexts/authContext.tsx:47–51`. `{ token, login, logout, signup, isLoading }` is a new object reference every render. `login`/`signup`/`logout` are redefined each render too. Fix: `useMemo` on the context value, `useCallback` on each function.

---

## List Performance Issues

**✅ 7. `DraggableFlatList` has inline `renderItem` and `onDragEnd`, no tuning props** — `components/list/edit-list.tsx:57–69`. Both callbacks are new references every render, defeating any internal memoization. No `initialNumToRender`, `maxToRenderPerBatch`, or `windowSize`. Fix: stabilize with `useCallback`; add `initialNumToRender={8}`, `maxToRenderPerBatch={5}`, `windowSize={5}`.

**✅ 8. `FlatList` in `PlayList` has inline `renderItem` and unstable `onItemCheckedChange`** — `components/list/play-list.tsx:124–135`. Both are new references on every check-off. `items` is `[...list.items].sort(...)` — a new array every render. No tuning props. Fix: `useMemo` for items, `useCallback` for both callbacks.

**9. `ScrollView` instead of `FlatList` for the lists overview** — `app/(app)/(tabs)/lists/index.tsx:44`. All list cards (each with a `Swipeable` and `GestureHandlerRootView`) mount simultaneously. Switch to `FlatList` for windowed rendering.

**10. ✅ `GestureHandlerRootView` inside each `ListCard`** — `components/list/list-card/list-card.tsx:23`. The root-level `GestureHandlerRootView` in `app/_layout.tsx:23` is sufficient. The per-card one adds redundant context providers that scale with list count. Fix: remove it from `ListCard`.

**11. No `getItemLayout` on either list** — `components/list/play-list.tsx`, `components/list/edit-list.tsx`. Row heights are fixed; adding `getItemLayout` enables scroll-position optimization and makes `scrollToIndex` reliable.

---

## Animation / Gesture Issues

**12. `CreateListSheet` uses legacy `Animated` API** — `components/list/create-list-sheet.tsx:19–22`. All animations correctly use `useNativeDriver: true`. However the app already uses Reanimated elsewhere; mixing both libraries increases bundle size. Opportunity to consolidate to Reanimated 3 (`useSharedValue`, `withSpring`, `withTiming`).

**✅ 13. `renderRightActions` in `Swipeable` is an inline arrow** — `components/list/list-card/list-card.tsx:28–30`. `ReanimatedSwipeable` uses the prop reference to decide whether to remount the action panel. An inline arrow means it remounts on every parent re-render, potentially resetting a mid-swipe interaction. Fix: `useCallback` inside a memoized `ListCard`.

**14. Inline `onPress`/`onClose` lambdas passed to `Modal`-backed sheet** — `app/(app)/(tabs)/lists/index.tsx:52–57`. `onClose` flows into `Animated.parallel(...).start(onClose)`. If `Index` re-renders mid-animation, `onClose` is a stale closure in the already-started animation. Fix: `useCallback` for both.

---

## State & Effect Issues

**15. `persistList` does a serial read+write on every keystroke** — `services/storage.service.ts:22–32`. Called from `updateItem` which fires on every character typed in item name/quantity fields (`edit-item-row.tsx:70`). Two chained AsyncStorage calls = 20–80 ms of I/O per keystroke on mid-range Android. Fix: split into `registerList(id)` (index update, called once on create) and `saveList(list)` (data write only); debounce calls from text fields with ~400 ms delay.

**✅ 16. `checkOrder` Set mutated in-place — React may bail on re-render** — `components/list/play-list.tsx:59–64`. `return order` returns the same Set reference; `Object.is` comparison means React may skip the re-render. Correctness bug. Fix: `return new Set(order)`.

**✅ 17. `items` sort and `checkedCount` computed inline every render in `PlayList`** — `components/list/play-list.tsx:21,24`. Every check-off triggers a full re-sort and re-filter. Fix: `useMemo` keyed on `list.items` for both.

**✅ 18. `onModeChange` not memoized in `ListScreen`** — `app/(app)/(tabs)/lists/[listId].tsx:31–46`. The function and its two inline-lambda wrappers are new references every render, preventing memoization of `EditList` / `PlayList` from working.

**19. `orderItems` is O(n²) and runs synchronously before mode switch** — `app/(app)/(tabs)/lists/[listId].tsx:33`, `domain/grocery/distance.ts:37–77`. Greedy nearest-neighbour sort with `distances.filter()` in a `while` loop blocks the JS thread before the mode animation starts. Fix: defer with `InteractionManager.runAfterInteractions` or `startTransition`.

**✅ 20. `subscribeToken` listener not cleaned up in `AuthContext`** — `contexts/authContext.tsx:22–27`. Return value of `subscribeToken` is discarded; the listener leaks if `AuthProvider` ever unmounts. Fix: return the unsubscribe function from the effect cleanup.

---

## Startup & Bundle Issues

**✅ 21. Hydration always shows a loading screen** — `app/(app)/(tabs)/lists/index.tsx:18–24`. `hydrate()` runs in a `useEffect` (after first paint), guaranteeing at least one frame of "Loading…" on every cold launch. Fix: call `useGroceryListStore.getState().hydrate()` at store module load time to give I/O a head start; or implement a skeleton list so the transition is imperceptible.

**22. `useLogin`/`useSignup` mutation hooks mounted unconditionally in `AuthProvider`** — `contexts/authContext.tsx:29–41`. Both React Query mutation observers are active for every screen of the app. Fix: move them into their respective screen components.

---

## Recommendations (highest impact first)

1. ✅ **Remove `GestureHandlerRootView` from `ListCard`** (`list-card.tsx:23`) — immediate mount-cost reduction per card.
2. **Fix Zustand selectors** in `ListScreen`, `Index`, `AppLayout` — eliminates cascading re-renders on every mutation.
3. **Debounce `updateItem` writes + split `persistList`** (`storage.service.ts:22`) — eliminates 40–80 ms of blocking I/O per keystroke.
4. **`React.memo` on `ListCard`, `EditItemRow`, `PlayItemRow`** — prevents all-rows re-render on parent updates.
5. **Stabilise `renderItem` and item callbacks** in `PlayList`/`EditList` with `useCallback` — without this, `React.memo` provides no benefit.
6. **Replace `ScrollView` with `FlatList` in `Index`** — windowed rendering, ~60% memory reduction for 20+ lists.
7. **`useMemo` for `items` sort and `checkedCount`** in `PlayList` — avoids full sort on every check-off.
8. **`useMemo`/`useCallback` on `AuthContext` value** — prevents all context consumers from re-rendering on unrelated changes.
9. **Defer `orderItems`** with `InteractionManager` — unblocks JS thread before mode-switch animation.
10. **Fix `checkOrder` Set mutation** — correctness bug, `return new Set(order)`.
11. **Fix `subscribeToken` cleanup** — memory leak guard.
12. **Add `getItemLayout`** to both list components — enables scroll optimizations.
13. **Stabilise inline lambdas** in `Index`, `ListScreen`, `ListCard`.
14. **Move `useLogin`/`useSignup`** into screen components.
