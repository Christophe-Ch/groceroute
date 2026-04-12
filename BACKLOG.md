# Groceroute — Product Backlog

> Living document. Move items to **Done** when shipped. Add notes inline.
> Last updated: 2026-04-12

---

## Phase 0 — Polish before backend (quick wins)

These are gaps in the existing local-only app that are worth closing before adding backend complexity.

### Auth routing (partial — needs finishing)
- [ ] Gate `(app)/` routes: if no token → redirect to `(auth)/login`
- [ ] Gate `(auth)/` routes: if token present → redirect to `(app)/`
- [ ] Hook up `AuthContext` token state to Expo Router conditional `<Slot>` in root layout
- **Why**: The axios interceptor, token service, and mutations are all wired — routing is the last missing piece. Doing this now avoids a mess when backend is live.

### Login / signup screens
- [ ] Replace "App title" placeholder with real branding
- [ ] Add proper error display on failed login / signup (currently mutations fire but no UI feedback)
- [ ] Basic form validation messages (empty fields, password length)

### Play session persistence
- [ ] Checked items reset when navigating away from play mode — decide: persist per-session in store, or accept reset?
- [ ] If persisting: add `playSession: Record<listId, Set<itemId>>` to store (ephemeral, not AsyncStorage)

### UX gaps
- [ ] Loading/skeleton state while `hydrated === false` (currently shows nothing)
- [ ] Confirmation toast after list delete (currently silent)
- [ ] Quantity input: allow decimal values (e.g. `0.5 kg`) — currently integer only?
- [ ] Long list names overflow in `ListCard` — add `numberOfLines={1}` truncation

### Accessibility
- [ ] Add `accessibilityLabel` to icon-only buttons (`ListCard` delete, `EditItemRow` delete)
- [ ] Ensure `TextInput` fields have associated labels (currently rely on placeholder text)

---

## Phase 1 — Backend: Auth + Sync

### 1.1 Auth management
- [ ] Wire login success → store token → redirect to app
- [ ] Wire logout → clear token → redirect to login
- [ ] Refresh token flow is already implemented in axios interceptor — test it end-to-end
- [ ] Handle expired/invalid token on cold start (tokenService `get()` → validate → logout if bad)

### 1.2 List sync
- [ ] `POST /lists` on `createList()`
- [ ] `DELETE /lists/:id` on `deleteList()`
- [ ] `PUT /lists/:id` on `updateList()` (name changes, item changes)
- [ ] `GET /lists` on `hydrate()` — replace AsyncStorage-only hydration with API fetch (keep AsyncStorage as offline cache)
- [ ] Conflict strategy: last-write-wins for MVP, flag for future CRDTs

### 1.3 Offline support
- [ ] Keep AsyncStorage as write-behind cache
- [ ] Queue mutations when offline, replay on reconnect
- [ ] Show sync status indicator (optional for MVP)

---

## Phase 2 — Multi-user & Collaboration

### 2.1 Shared lists
- [ ] Invite user to a list by email / username
- [ ] List ownership model (owner + collaborators)
- [ ] Show collaborator avatars on `ListCard`

### 2.2 Split list at play time
- [ ] During play mode, split items N ways among participants
- [ ] Each participant gets their own subset, shown on their device
- [ ] Algorithm: round-robin or by aisle/category proximity

### 2.3 Live updates
- [ ] WebSocket or SSE channel per list
- [ ] Real-time check/uncheck sync during shared play session
- [ ] Item add/remove propagated live to all collaborators

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

---

## Phase 4 — Platform & Distribution

- [ ] Push notifications: "Don't forget your list!" reminder when near a store (geofence)
- [ ] Widget (iOS/Android) showing active list item count
- [ ] Barcode scanner → look up product name, pre-fill item
- [ ] App Store / Play Store submission checklist
- [ ] App icon finalization + splash screen

---

## Done

- [x] Create / delete lists
- [x] Add / remove items with quantity support
- [x] Play mode with check / uncheck + progress bar
- [x] Past items for autocomplete
- [x] Check-order detection (distance graph) for auto-ordering on play start
- [x] Drag & drop reordering in edit mode
- [x] Axios client with bearer token injection + auto-refresh interceptor
- [x] Token service (SecureStore) with subscription model
- [x] AsyncStorage persistence with hydration on app start
