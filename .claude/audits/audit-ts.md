# TypeScript Audit — 2026-04-11

## Summary

The codebase is reasonably well-typed and `strict: true` is enabled, which prevents the worst class of errors. However, several real problems exist: a type mismatch between `GroceryItem.quantity` (declared `string`, assigned `number 1` in the store), two `any`-typed `Control` generics that eliminate all form-field type safety, and multiple non-null assertions / unguarded map lookups that can crash at runtime. The remaining issues are moderate gaps — missing return types, an unsafe Axios cast, and patterns that would break under stricter compiler flags.

---

## Critical Issues

### 1. ✅ `quantity` assigned as `number` but typed as `string`
**`store/grocery-list.store.ts` line 88 / `models/grocery/grocery-item.ts` line 4**

`GroceryItem.quantity` is declared `string`, but `addItem` sets `quantity: 1` (a numeric literal). TypeScript allows this because the explicit `GroceryList` annotation on the outer object broadens the check — at runtime every newly created item carries a `number` in a field every consumer renders as a `string`. `play-list.tsx` line 43 confirms the intended type by assigning `draft.quantity = ""`. Fix: change the store initialisation to `quantity: "1"`.

### 2. ✅ Unguarded `get().lists[id]` passed to `persistList`
**`store/grocery-list.store.ts` lines 71, 100, 110, 128, 140, 150**

After calling `set(produce(...))`, six actions call `get().lists[listId]` and pass the result directly to `storageService.persistList(list: GroceryList)`. Because `lists` is typed as `Record<string, GroceryList>` (not `Partial<Record<...>>`), TypeScript does not flag the access as possibly `undefined`. But if `listId` is absent, `persistList` receives `undefined` and immediately dereferences `list.id` — a crash. All six call sites need a guard: `const list = get().lists[listId]; if (list) await storageService.persistList(list);`

### ✅ 3. Non-null assertion on `Array.find` result
**`components/list/play-list.tsx` line 55**

```ts
draft.items.find((i) => i.id === itemId)!.checked = checked;
```

`find` returns `T | undefined`. The `!` silently discards the undefined case. If `itemId` is stale (item deleted between renders), this throws at runtime. Replace with a null-check guard.

### ✅ 4. Non-null assertion on optional `pastItems` prop
**`components/item/edit-item-row.tsx` line 62**

```ts
setAutocomplete(findItems(text, pastItems!, currentItemIds));
```

`pastItems?: GroceryItem[]` is optional in `EditItemRowProps`. The guard `if (!item && text.trim().length >= 2)` does not guarantee `pastItems` is defined — they are independent props. This passes `undefined` to `findItems(search, items: GroceryItem[])`, causing a runtime crash on valid usage. Fix: `if (pastItems) setAutocomplete(findItems(text, pastItems, currentItemIds));`

---

## Moderate Issues

### 5. `Control<any, any, any>` destroys form type safety
**`components/themed-input.tsx` line 21 / `components/image-picker.tsx` line 6**

Both components accept `control?: Control<any, any, any>`. The `Control` generic is intended to carry `TFieldValues`, which ties `name` string literals to their value types. Using `any` here means the compiler cannot detect mismatched field names. Make the components generic: `type InputProps<T extends FieldValues = FieldValues> = TextInputProps & { control?: Control<T>; name?: Path<T>; ... }`.

### ✅ 6. `logout` return type mismatch between interface and implementation
**`contexts/authContext.tsx` lines 9 and 43**

`AuthContextType.logout` is declared `() => void` but implemented as `async () => { await tokenService.clearTokens(); }` which returns `Promise<void>`. The interface should be `logout: () => Promise<void>`.

### ✅ 7. Unsafe cast on `error.config` in the Axios interceptor
**`api/client.ts` line 23**

```ts
const originalRequest = error.config as InternalAxiosRequestConfig;
```

`error.config` is `InternalAxiosRequestConfig | undefined`. The cast removes the `undefined`. On network timeout errors Axios may omit `config`, causing a crash when accessing `originalRequest._retry`. Add a guard before the cast.

### ✅ 8. Ternary used for side-effect calls (violates project convention)
**`components/item/edit-item-row.tsx` lines 39–41**

```ts
return trimmed
  ? updateItem(listId, item.id, { name: trimmed })
  : deleteItem(listId, item.id);
```

Per the project memory, ternary must not be used for side-effect calls. Use `if/else`.

### 9. `renderInput` local function parameters typed as `any`
**`components/themed-input.tsx` lines 61–63**

`onChangeText`, `onBlur`, and `onFocus` are typed `any` inside `renderInput`. Proper types from `TextInputProps` are available and should be used.

### 10. `storageService.hydrate()` silently accepts unvalidated JSON as `GroceryList[]`
**`services/storage.service.ts` lines 17–19**

`JSON.parse` returns `any`; `.filter(Boolean)` narrows to `any[]`, which TypeScript accepts as `GroceryList[]` without complaint. Critically, `JSON.stringify(new Date())` produces an ISO string — so `createdAt`, `updatedAt`, `deletedAt` come back from storage as `string`, not `Date`, violating the model. Either deserialise dates explicitly or change the model to `string` for those fields.

### ✅ 11. Untyped `produce()` draft in `reorderItems`
**`store/grocery-list.store.ts` line 145**

All other `produce` calls annotate the draft as `(s: GroceryListStore)`. `reorderItems` omits the annotation, relying on Immer's contextual inference from `create<GroceryListStore>`. Add the annotation for consistency.

### 12. `ItemDistance` not exported from the barrel
**`models/grocery/index.ts`**

`ItemDistance` is used in `GroceryList` and `domain/grocery/distance.ts` but is not re-exported from `models/grocery/index.ts`, forcing consumers to import from the deep path. Add `export { ItemDistance } from "./item-distance";`.

---

## Minor / Style Issues

### 13. Dead `distance` field on `ItemDistance`
**`models/grocery/item-distance.ts` line 3**

The `distance: number` field is initialised to `1` in `computeDistances` but never updated and never read by `orderItems` (which sorts by `count`). Remove it or document its purpose.

### 14. Mixed `interface` vs `type` usage in models
`AuthResponse` in `models/auth/auth-response.ts` uses `interface`; all grocery models use `type`. Standardise on `type` for data shapes.

### ✅ 15. Dead `StyleSheet` entries in login and signup screens
**`app/(auth)/login.tsx` lines 97–107 / `app/(auth)/signup.tsx` lines 119–135**

`styles.title` and `styles.subtitle` are defined but never referenced in JSX — leftover from an earlier implementation.

### 16. `app.config.ts` `extra` field is untyped
**`api/client.ts` line 7**

`Constants.expoConfig?.extra?.API_BASE_URL` traverses `Record<string, unknown>`. Adding a TypeScript augmentation for `ExpoConfig.extra` would give `API_BASE_URL` a proper type and improve autocomplete.

---

## Recommendations (highest impact first)

1. ✅ Fix `quantity: 1` → `quantity: ""` in `store/grocery-list.store.ts` line 88.
2. ✅ Guard all six `get().lists[id]` calls before passing to `persistList`.
3. Replace `!` non-null assertion in `play-list.tsx` line 55 with a null-check guard.
4. Replace `!` non-null assertion on `pastItems` in `edit-item-row.tsx` line 62 with a guard.
5. Make `ThemedInput` and `ImagePicker` generic over `FieldValues`.
6. Fix `logout` return type in `AuthContextType` to `() => Promise<void>`.
7. Guard `error.config` before casting in `api/client.ts`.
8. Convert the ternary side-effect call in `edit-item-row.tsx` to `if/else`.
9. Deserialise or retype `Date` fields coming out of `storageService.hydrate()`.
10. Export `ItemDistance` from `models/grocery/index.ts`.
11. Type `renderInput` parameters with proper `TextInputProps` types.
12. Remove dead `styles.title`/`styles.subtitle` from login and signup.
13. Remove or document the dead `distance` field on `ItemDistance`.
14. Standardise `interface` vs `type` — use `type` for all data model definitions.
