# Code Cleanliness Audit — 2026-04-11

## Summary

The codebase is small, relatively well-structured, and follows consistent kebab-case naming for files throughout. The primary cleanliness concerns are: dead style entries in multiple `StyleSheet.create()` blocks; a significant duplication in the login/signup page structure that warrants extraction; several hardcoded magic values (numbers and color strings) scattered across components; and a handful of inconsistencies in import ordering and component patterns that accumulate across files.

---

## Dead Code

### Unused StyleSheet entries

**`app/(auth)/login.tsx` — lines 97–107**
The `title` and `subtitle` style entries are defined in the `StyleSheet.create()` block but never referenced. The screen renders those elements as inline `View` children using `ThemedText` type props, not these styles.
```
title: { fontSize: 46, textAlign: "center", fontWeight: "bold" },
subtitle: { fontSize: 20, color: "#777", textAlign: "center" },
```
Action: Delete both entries.

**`app/(auth)/signup.tsx` — lines 124–134**
Identical dead `title` and `subtitle` style entries as in `login.tsx` — also never referenced.
Action: Delete both entries.

---

### Unused prop on component interface

**`components/item/play-item-row.tsx` — line 9**
`PlayItemRowProps` declares `listId: string`, but the component destructuring at line 14 does not destructure `listId`, and it is never used inside the component body.
```ts
type PlayItemRowProps = {
  listId: string;   // ← declared but never used
  item: GroceryItem;
  onItemCheckedChange: (itemId: string, checked: boolean) => void;
};
```
Action: Remove `listId` from the prop type and all call sites (only one: `components/list/play-list.tsx` line 129).

---

### Unused import

**`app/_layout.tsx` — line 8**
`import "react-native-reanimated";` is a bare side-effect import. Reanimated requires this import to be present in the root entry file for its Babel plugin. However the comment explaining *why* is missing, making it look like dead code to any reader. The import itself is not dead (it bootstraps Reanimated), but it needs a clarifying comment.
Action: Add `// Required: initialises Reanimated on app boot` inline.

**`components/ui/icon-symbol.tsx` — line 4**
`SymbolWeight` and `SymbolViewProps` are imported from `expo-symbols`, but `IconSymbol` in the non-iOS fallback file only uses `SymbolWeight` as a declared-but-ignored prop type (the `weight` prop is accepted in the interface at line 36 but the parameter is not destructured — it is intentionally unused on Android/web). However, `SymbolViewProps` is used only as a type reference for the `name` key in `MAPPING` and for the function parameter. This is valid but worth noting that `weight` is silently dropped — add a comment.

**`components/image-picker.tsx` — line 1**
`Control` is imported from `react-hook-form`. It is used for the prop type (`control: Control<any, any, any>`). This is fine, but the three `any` type parameters on `Control` could be simplified to `Control<any>` — only one generic is required (the other two have defaults).

---

### `quantity` type mismatch (dead initialiser)

**`store/grocery-list.store.ts` — line 89**
`quantity: 1` — the model (`GroceryItem`) types `quantity` as `string`, but the store initialises it as the number `1`. The string initialiser used elsewhere is `""`. The number `1` is a silent type violation; the correct empty value is `""`.
Action: Change `quantity: 1` → `quantity: ""`.

---

## Duplication

### Login and Signup screens share nearly identical structure

**Files:** `app/(auth)/login.tsx` and `app/(auth)/signup.tsx`

Both screens share:
- The same container/layout (`ThemedView` + inner `View` + `KeyboardAvoidingView`)
- The same `StyleSheet.create({ container, title, subtitle })` block — character-for-character identical
- The same email + password inputs with identical validation rules
- The same `<Link>` + `<ThemedButton>` footer pattern
- Both use `useSafeAreaInsets()` for `keyboardVerticalOffset`

The `container` style object is identical across both files:
```ts
container: { padding: 20, flex: 1, justifyContent: "space-between", gap: 16 }
```
Suggested extraction:
1. Move the shared `container` style to a `constants/styles.ts` (or co-locate with auth screens as `_auth-styles.ts`).
2. Extract an `AuthScreenLayout` component that accepts a `footer` and `fields` render prop or children, removing the structural duplication.

---

### Duplicate `title` style in `EditList` and `PlayList`

**Files:** `components/list/edit-list.tsx` lines 85–91 and `components/list/play-list.tsx` lines 159–166

Both define an identical `title` style for the editable/read-only list name input:
```ts
title: {
  fontSize: 32, fontWeight: "bold", lineHeight: 32,
  backgroundColor: "transparent", borderWidth: 0, padding: 0, margin: 20,
}
```
Action: Extract this shared style into a shared constant (e.g. `constants/list-styles.ts` or a shared object exported from a shared file) and import it in both components.

---

### `listHeader` style repeated in `EditList` and `PlayList`

**Files:** `components/list/edit-list.tsx` line 94 and `components/list/play-list.tsx` line 168

Both define a `listHeader` style. In `EditList`:
```ts
listHeader: { paddingInline: 20, paddingBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }
```
In `PlayList`:
```ts
listHeader: { paddingInline: 20, paddingBottom: 10, gap: 8 }
```
These are not identical but share the same `paddingInline` / `paddingBottom` base. Extracting a shared base object is lower priority, but worth noting alongside the `title` duplication above.

---

### Auth mutation inline types duplicated

**File:** `hooks/auth/use-auth-mutations.ts` lines 6–7 and 13–14

The `{ email: string; password: string }` inline type is written twice — once in `useLogin` and once in `useSignup`. Since both mutations share the same payload shape, extract a `AuthCredentials` type (or reuse `LoginForm` / `SignupForm` from the screens — though cross-layer coupling would be worse):
```ts
type AuthCredentials = { email: string; password: string };
```
Action: Define once at the top of the file and use in both `mutationFn` signatures.

---

## Naming Issues

### `ctx` — overly generic local variable

**`hooks/auth/use-auth.ts` — line 4**
```ts
const ctx = useContext(AuthContext);
```
`ctx` is a common shorthand but in a typed context with a single well-known type, `authContext` or simply `context` is more readable. Minor, but consistent with avoiding generic abbreviations.
Action: Rename to `authContext`.

---

### `s` — single-letter parameter in Immer producers

**`store/grocery-list.store.ts` — lines 52, 64, 76**
```ts
produce((s: GroceryListStore) => { s.lists[list.id] = list; })
```
`s` is used as the draft state parameter. Other actions use `state` (line 144) or `draft` (implicitly via Immer). There is no consistent name across actions.
- Line 52: `s`
- Line 64: `s`
- Line 76: `s`
- Line 144: `state`

Action: Standardise all Immer draft parameters to `draft` (most idiomatic for Immer usage).

---

### `idea` — semantically misleading name in autocomplete loop

**`components/item/edit-item-row.tsx` — line 115**
```ts
{autocomplete.map((idea) => (
```
The items in the autocomplete list are `GroceryItem` objects — naming them `idea` is informal and inconsistent with the rest of the codebase which uses `item`. 
Action: Rename to `suggestion` or simply `item`.

---

### `onSetQuantity` — verb form inconsistency

**`components/item/edit-item-row.tsx` — line 68**
All other local handlers are named `onXxx` where `Xxx` is the event or noun (e.g. `onSubmit`, `onChangeText`). `onSetQuantity` mixes event-handler convention with an imperative verb. Rename to `onQuantityChange` for consistency with React's convention and `onChangeText`.

---

### Component name `DeleteAction` vs export name `ListCardAction`

**`components/list/list-card/list-card-action.tsx`**
The component is internally named `DeleteAction` (line 15) but exported as `DeleteAction` and the file is named `list-card-action.tsx`. The index exports it without renaming. The caller in `list-card.tsx` imports it as `ListCardAction`. This creates a mismatch: the file name suggests a generic action component, but the internal name is specific to delete. The type name `DeleteActionProps` (line 10) is accurate — the file name is the misleading part.
Action: Either rename the file to `delete-action.tsx` (and update the barrel) to match its single responsibility, or rename the component to `ListCardAction` to match the import alias and file name.

---

### `panelAnim` initial value `400` is a magic number

See the Magic Values section below.

---

## Magic Values

### `400` — hardcoded panel slide distance

**`components/list/create-list-sheet.tsx` — lines 20 and 79**
```ts
const panelAnim = useRef(new Animated.Value(400)).current;
// ...
panelAnim.setValue(400);
// ...
toValue: 400,
```
`400` represents the off-screen translation distance for the bottom sheet panel. It is used in three places in the same file. If the panel height changes, all three must be updated.
Action: Define `const PANEL_SLIDE_DISTANCE = 400;` at the top of the file.

---

### `80` — delete action width used in two places

**`components/list/list-card/list-card-action.tsx` — lines 18 and 49**
```ts
transform: [{ translateX: drag.value + 80 }],
// ...
width: 80,
```
`80` is the pixel width of the swipe-to-delete action button, hardcoded in both the animation formula and the style. A change to one requires changing the other.
Action: Define `const DELETE_ACTION_WIDTH = 80;` at the top of the file.

---

### `"rgba(0,0,0,0.4)"` — hardcoded color outside theme

**`components/list/create-list-sheet.tsx` — line 122**
```ts
backgroundColor: "rgba(0,0,0,0.4)",
```
This is a hardcoded overlay color that does not use the theme system. In light mode it works fine, but if the backdrop needs to differ by theme, there is no hook point.
Action: Move to `Colors` (e.g. `backdropOverlay: "rgba(0,0,0,0.4)"`) or at minimum define a module-level constant `const BACKDROP_COLOR = "rgba(0,0,0,0.4)";`.

---

### `"#777"` — hardcoded color in dead style entries

**`app/(auth)/login.tsx` — line 104** and **`app/(auth)/signup.tsx` — line 131**
```ts
color: "#777",
```
This is inside the already-dead `subtitle` style block, so fixing the dead code (removing those blocks) eliminates this too. Listed for completeness.

---

### `"#0a7ea4"` — hardcoded color in ThemedText link style

**`components/themed-text.tsx` — line 68**
```ts
color: "#0a7ea4",
```
The `link` text type has a hardcoded hex color that is not derived from the theme. The same value is already defined in `Colors.light.primary`. Use `useThemeColor({}, "primary")` instead, or since `ThemedText` is a pure-render component with no hooks, move the color into the style via a `lightColor`/`darkColor` prop pattern already supported by `ThemedText`.
Action: Remove the hardcoded value and apply theme colors via the component's existing `lightColor`/`darkColor` mechanism, or refactor `link` to be a variant that uses the theme.

---

### `"item-" + Date.now()` and `"list-" + Date.now()` — ID generation pattern

**`store/grocery-list.store.ts` — lines 41 and 87**
```ts
id: "list-" + Date.now(),
id: "item-" + Date.now(),
```
These are not magic values per se, but using `Date.now()` as an ID is collision-prone (two rapid additions yield the same timestamp). This is an adjacent code quality issue. If a proper UUID library is not added, at minimum define constants for the prefixes:
```ts
const LIST_ID_PREFIX = "list-";
const ITEM_ID_PREFIX = "item-";
```

---

### `500` — magic bleed height in `create-list.tsx`

**`components/list/create-list.tsx` — lines 67–68**
```ts
bottom: -500,
height: 500,
```
The `backgroundBleed` view extends 500px below the panel to cover content revealed when the keyboard dismisses. This value is undocumented and would need updating if the approach changes.
Action: Define `const BACKGROUND_BLEED_HEIGHT = 500;` with a comment explaining why it exists.

---

### `"26"` — opacity suffix in `list-card.tsx`

**`components/list/list-card/list-card.tsx` — line 36**
```ts
backgroundColor: primary + "26",
```
`"26"` is a hex opacity suffix (≈15% opacity) appended to the primary color string. This is a non-obvious technique that produces a result like `"#52B78826"`. The value `"26"` is magic and the pattern itself is fragile (only works if `primary` is a 6-digit hex string).
Action: Add a brief inline comment: `// "26" = ~15% opacity hex suffix` and consider a named constant `const BADGE_OPACITY_HEX = "26"`.

---

### `keyboardVerticalOffset={insets.top + 16}` — repeated magic offset

**`app/(auth)/login.tsx` — line 68**, **`app/(auth)/signup.tsx` — line 96**, **`components/list/edit-list.tsx` — line 51**
All three use `insets.top + 16` as the `KeyboardAvoidingView` vertical offset. The `16` is a magic spacing value.
Action: Define a named constant (e.g. `KEYBOARD_OFFSET_PADDING = 16`) or derive it from a spacing scale if one is introduced.

---

## Oversized Functions & Components

No single function or component significantly exceeds the 40-line / 150-line thresholds. The largest components are:

- **`components/list/play-list.tsx`** — 154 lines total, 104 lines of JSX + logic. `updateDistances` (lines 32–49) is a standalone data-transformation function embedded directly in the component body. It would be cleaner as a module-level pure function or a custom hook.
- **`components/list/create-list-sheet.tsx`** — 125 lines. The keyboard listener logic (lines 24–48), the `open` function (lines 50–67), and the `close` function (lines 69–91) together handle all animation. These are well-contained but could be extracted into a `useSheetAnimation(visible)` hook to make the component itself render-only.
- **`store/grocery-list.store.ts`** — 152 lines. None of the individual store actions are long, but the file is at the threshold. Acceptable for a Zustand store.

---

## Consistency Issues

### Mixed named vs. default exports for components

Some components use named exports, others use default exports — without a clear rule:

- **Named exports**: `ThemedText`, `ThemedView`, `ThemedIcon`, `IconSymbol`
- **Default exports**: `ThemedButton`, `ThemedInput`, `EditList`, `PlayList`, `CreateList`, `CreateListSheet`, `ListCard`, `EditItemRow`, `PlayItemRow`, `ImagePicker`

The `ThemedText` and `ThemedView` components (from the Expo starter) use named exports, while all application-specific components use default exports. This inconsistency means developers cannot predict which import style to use without checking each file.
Action: Standardise on default exports for all component files (the majority pattern), or introduce a rule in the linting config.

---

### `React` import: present in some files, absent in others

Files that import `React` explicitly:
- `components/themed-button.tsx` (line 3)
- `components/themed-icon.tsx` (line 1)
- `components/themed-input.tsx` (line 2)
- `app/(auth)/_layout.tsx` (line 3)

Files that do not import `React`:
- All other component files

With React 17+ and the new JSX transform (enabled in Expo), `import React from "react"` is not required. The three component files that still include it have a stale import.
Action: Remove `import React from "react"` from `themed-button.tsx`, `themed-icon.tsx`, `themed-input.tsx`, and `app/(auth)/_layout.tsx` for consistency with the rest of the codebase.

---

### Mixed import ordering: third-party vs. internal

The import ordering convention varies across files. Some files group third-party imports first and then `@/` path-aliased imports; others intermix them.

**Example — `components/list/play-list.tsx` lines 1–12:**
```ts
import { computeDistances } from "@/domain/grocery/distance";  // internal first
import { GroceryList } from "@/models/grocery/grocery-list";   // internal
import { useThemeColor } from "@/hooks/ui/use-theme-color";    // internal
import { useGroceryListStore } from "@/store/grocery-list.store"; // internal
import { produce } from "immer";                               // third-party
import { useState } from "react";                              // third-party
import { Alert, StyleSheet, View } from "react-native";        // third-party
import { FlatList } from "react-native";                       // third-party
```

**Compare — `app/(auth)/signup.tsx` lines 1–11:**
```ts
import ThemedButton from "@/components/themed-button";  // internal first
import ...
import { isAxiosError } from "axios";                   // then third-party
```

The dominant pattern in the codebase is third-party imports first (`react`, `react-native`, external libraries) then `@/` path imports then relative imports. Several files reverse this. ESLint's `import/order` rule (or Prettier with `@trivago/prettier-plugin-sort-imports`) would enforce this automatically.
Action: Add `eslint-plugin-import` with `import/order` rule to enforce: `builtin → external → internal (@/) → relative`.

---

### Two separate `FlatList` imports in `play-list.tsx`

**`components/list/play-list.tsx` — lines 7–8**
```ts
import { Alert, StyleSheet, View } from "react-native";
import { FlatList } from "react-native";
```
`FlatList` should be on the same line as the other `react-native` imports.
Action: Merge into `import { Alert, FlatList, StyleSheet, View } from "react-native";`.

---

### `Pressable onPress={() => {}}` — no-op handler

**`components/list/create-list-sheet.tsx` — line 105**
```ts
<Pressable onPress={() => {}}>
```
This `Pressable` wraps the `CreateList` panel to prevent touch events from propagating to the backdrop dismiss handler. The no-op is intentional but looks like incomplete code. A comment is needed.
Action: Add `{/* Absorbs taps so pressing inside the panel doesn't trigger the backdrop close */}` and consider replacing with `<View pointerEvents="box-none">` or similar if the touch interception is the only goal.

---

### `useEffect` hydration guard inconsistency

**`app/(app)/(tabs)/_layout.tsx` — lines 14–18**
```ts
useEffect(() => {
  if (!hydrated) {
    hydrate();
  }
}, [hydrate, hydrated]);
```
The guard `if (!hydrated)` inside the effect is consistent with the project's stated pattern. However the `if/else` vs ternary memory note applies here — the call is already correctly in an `if` block (not a ternary), so this is compliant.

---

## Comment Quality

### Missing comment explaining bare Reanimated import

**`app/_layout.tsx` — line 8**
```ts
import "react-native-reanimated";
```
No comment explains why this side-effect-only import exists. New contributors will reasonably assume it is dead code and remove it.
Action: `// Required: registers Reanimated's native module on app start (must be in the root layout)`.

---

### Missing comment on `backgroundBleed` in `create-list.tsx`

**`components/list/create-list.tsx` — lines 65–71**
The `backgroundBleed` view with `bottom: -500` / `height: 500` is a deliberate hack to prevent the background color from showing through as the sheet is dragged or the keyboard hides. Without a comment, this looks like a bug.
Action: Add: `// Extends the panel background below the visible area to cover the overscroll reveal`.

---

### Missing comment on `"26"` opacity hex suffix

**`components/list/list-card/list-card.tsx` — line 36**
(See also Magic Values above.) The `primary + "26"` expression needs a brief inline comment for any reader unfamiliar with hex alpha suffixes.

---

### No comment on `_start` sentinel value

**`components/list/play-list.tsx` — line 28** and **`domain/grocery/distance.ts` — line 47**
```ts
new Set(["_start"])
// ...
let lastItemId = "_start";
```
`"_start"` is a sentinel representing the store entrance/start-of-shopping position in the distance graph. It is used in two files with no explanation of what it means or why it is `"_start"` rather than `null` or `""`.
Action: Define `const SHOPPING_START_SENTINEL = "_start";` (or `"_start"` as a named export from the distance module) and add a short comment: `// Represents the virtual "start" node for the shopping route graph`.

---

### `TODO/FIXME` — none found

No unaddressed TODO or FIXME comments were found in the codebase.

---

### Misleading comment in `icon-symbol.tsx`

**`components/ui/icon-symbol.tsx` — line 1**
```ts
// Fallback for using MaterialIcons on Android and web.
```
This comment is accurate. No action needed. (Noted for completeness of coverage.)

---

## Recommendations

Ordered by impact (most files affected or most likely to cause a bug first):

1. **Fix the `quantity: 1` type mismatch** (`store/grocery-list.store.ts` line 89) — the model types `quantity` as `string` but the store sets it to `1`. This will cause subtle rendering bugs (e.g. `"1"` vs `1` comparisons, truthy checks) and is the only finding that directly risks a runtime defect.

2. **Remove the unused `listId` prop from `PlayItemRowProps`** (`components/item/play-item-row.tsx`) — the prop is declared, propagated at the call site, and then silently dropped. It pollutes the API surface with a non-functional parameter.

3. **Extract the duplicated auth screen layout** (`login.tsx` + `signup.tsx`) — identical `StyleSheet`, identical `KeyboardAvoidingView` pattern, identical field structure. Extract an `AuthScreenLayout` component and a shared styles constant. This is the highest-leverage structural deduplication.

4. **Extract the duplicated `title` style** from `EditList` and `PlayList` into a shared constant — character-for-character identical in both files; one change point instead of two.

5. **Standardise Immer draft parameter names** across all store actions (`s` → `draft`) — small but affects every developer reading the store.

6. **Remove stale `import React from "react"`** from `themed-button.tsx`, `themed-icon.tsx`, `themed-input.tsx`, and `app/(auth)/_layout.tsx` — React 17+ JSX transform makes these unnecessary and they diverge from every other component file.

7. **Add `eslint-plugin-import` with `import/order`** — the mixed import ordering across files is the most systemic consistency issue and is best fixed tooling-first rather than file-by-file.

8. **Name the magic constants**: `PANEL_SLIDE_DISTANCE` (400), `DELETE_ACTION_WIDTH` (80), `BACKGROUND_BLEED_HEIGHT` (500), `BADGE_OPACITY_HEX` ("26"), `SHOPPING_START_SENTINEL` ("_start") — each appears in multiple locations or is non-obvious without context.

9. **Fix the `"#0a7ea4"` hardcoded color** in `ThemedText` link style — the only hardcoded hex in a themed component file; it breaks dark-mode correctness for the `link` text type.

10. **Add comments** for the bare Reanimated import, the `backgroundBleed` view, the `"_start"` sentinel, and the no-op `Pressable` — these four are the most likely to cause confusion or accidental deletion during future maintenance.

11. **Merge the split `FlatList` import** in `play-list.tsx` — cosmetic but trivial to fix.

12. **Rename `onSetQuantity` → `onQuantityChange`** and `idea` → `suggestion`/`item` in `edit-item-row.tsx` — minor naming alignment with React conventions and the rest of the codebase.
