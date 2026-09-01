# Groceroute — Product Backlog

> Living document. Move items to **Done** when shipped. Add notes inline.
> Last updated: 2026-08-31

The core product is shipped: lists, play mode with learned ordering, auth, offline-first
operation sync, live collaboration and split shopping. What's left below is deliberately
optional — nice-to-haves picked up when there's an appetite for them, not a path to a
release.

---

## Next up (small, worth doing)

- [ ] Loading / skeleton state while `hydrated === false` — `AppLayout` currently renders `null`
- [ ] Truncate long list names in `ListCard` (`numberOfLines={1}`)
- [ ] Confirmation toast after deleting a list (currently silent)
- [ ] Sync status indicator — surface queued-but-unpushed operations in the UI
- [ ] Unit tests on the mobile side: `orderItems()` distance algorithm and the operation handlers

---

## Phase 2 — Collaboration (remainder)

### 2.1 Shared lists
- [x] Share a list — join by ID, or by scanning its QR code
- [x] Participant model: creator recorded as owner on `CREATE_LIST`
- [ ] Permissions are currently flat — any participant can apply any operation. Introduce
      owner-only operations (rename, delete, remove participant) if it ever matters
- [ ] Show participant avatars on `ListCard`
- [ ] Invite by email / username (QR + ID covers the need today — only worth it if sharing
      needs to work without both people present)

### 2.2 Split list at play time
- [x] Pick participants when starting a session
- [x] Items divided between shoppers, each swiping to their own subset
- [ ] Smarter split than contiguous slices — balance by aisle/category proximity

### 2.3 Live updates
- [x] SSE channel per user, filtered to the lists they participate in
- [x] Real-time check/uncheck and item add/remove across collaborators
- [x] Catch-up pull on stream open, on app foreground, and after reconnect

---

## Phase 3 — Smart features

### 3.1 Recipe store
- [ ] Recipe model: name, servings, ingredients (name + quantity + unit)
- [ ] Recipe browser / CRUD UI
- [ ] "Add to list" from recipe: maps ingredients to list items
- [ ] Scaling: multiply quantities by desired servings

### 3.2 Meal planning
- [ ] Weekly calendar view (Mon–Sun)
- [ ] Assign recipes to days / meals (breakfast, lunch, dinner)
- [ ] "Generate shopping list" → aggregate all ingredients for the week, deduplicate

### 3.3 Item categorization & aisle grouping
- [ ] Add optional `category` field to `GroceryItem` (produce, dairy, meat, …)
- [ ] Group items by category in edit + play mode
- [ ] Integrate with `orderItems()` distance algorithm — prefer same-aisle proximity

### 3.4 Price tracking (stretch)
- [ ] Add optional `price` field to `GroceryItem`
- [ ] Show estimated total on list and in play mode
- [ ] Track price history per item across lists

### 3.5 Shopping timer
- [ ] Track session duration from `START_SHOPPING` to `FINISH_SHOPPING`
- [ ] Show elapsed time in play mode, and history per list

---

## Phase 4 — Platform & Distribution

- [ ] Push notifications: "Don't forget your list!" reminder when near a store (geofence)
- [ ] Widget (iOS/Android) showing active list item count
- [ ] Barcode scanner → look up product name, pre-fill item
- [ ] App Store / Play Store submission checklist
- [ ] App icon finalization + splash screen
- [x] README screenshots (4, dark theme, iPhone 17 Pro)
- [ ] Demo GIF of a play session

---

## Done

### Lists & play mode
- [x] Create / delete / rename lists
- [x] Add / remove items, rename items, quantity support (free-text, so decimals work)
- [x] Play mode with check / uncheck + progress bar
- [x] Finish or abandon a shopping session
- [x] Past items for autocomplete
- [x] Check-order detection (distance graph) for auto-ordering on play start
- [x] Drag & drop reordering in edit mode
- [x] Checked state survives navigating away — it lives in the list, not in ephemeral UI state

### Auth
- [x] Axios client with bearer token injection + auto-refresh interceptor
- [x] Token service (SecureStore) with subscription model
- [x] Login / signup screens with real branding, validation messages and error toasts
- [x] Auth state in `useAuthStore`; login is a modal, sign-out from the Account tab
- [x] ~~Gate `(app)` / `(auth)` routes by token~~ — obsolete: the app is usable signed out
      (local-only lists) and prompts for sign-in where an account is actually required

### Sync
- [x] Operation-based sync engine — client and server share operation types and apply them
      through their own handler registries
- [x] `POST /sync/push` batch endpoint, idempotent by operation id, per-list locking,
      monotonic sequence numbers, projectors folding operations into entities
- [x] `GET /sync/pull?listId&lastSequence` for catch-up
- [x] Actor authorization at the operations-service level
- [x] AsyncStorage persistence with hydration on app start
- [x] Offline outbox: operations queued locally, debounced push, replayed on reconnect
- [x] Conflict strategy: the server-assigned sequence is authoritative and ordering is
      last-write-wins — good enough for lists, revisit only if a real conflict shows up

### Infrastructure
- [x] API on Cloud Run, deployed from `main` via GitHub Actions (lint + tests, image to
      Artifact Registry, migrations as a Cloud Run job, then a new revision)
- [x] EAS Build + EAS Update with development / preview / production channels
- [x] Unit tests on the API: operations service/handler, projectors, auth controller
