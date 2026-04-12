# Groceroute

A cross-platform grocery list app that makes shopping smarter. Build lists, let the app figure out the most efficient order to pick items up, and check them off as you go — together with others or on your own.

Runs on **iOS** and **Android** from a single codebase.

---

## Features

### Lists
Create as many grocery lists as you need — weekly shop, party prep, meal prep, anything. Lists are saved locally on your device and persist across app restarts.

### Adding items
Add items with names and quantities. As you type, the app suggests items you've added before, so repeat staples are a single tap. Remove items individually or delete an entire list when you're done.

### Drag & drop reordering
In edit mode, hold and drag any item to rearrange the list exactly the way you want it.

### Play mode
Tap **Play** to start a shopping session. The app automatically reorders your items using a distance-based algorithm — items you tend to pick up in sequence stay grouped together, minimizing backtracking through the store.

During play mode:
- Tap an item to check it off
- A progress bar shows how much of the list is done
- Checked items visually separate from remaining ones

### Check-order learning
The app tracks the order in which you check items off during each session. Over time, it builds a graph of which items you pick up near each other and uses that to sort your list more accurately on future runs.

### Offline-first
Everything works without a network connection. All data is stored on-device via AsyncStorage and loads instantly on app start.

---

## What's coming

| Feature | Status |
|---------|--------|
| Backend sync & multi-device | Planned — Phase 1 |
| Shared lists with collaborators | Planned — Phase 2 |
| Live real-time sync during shared play session | Planned — Phase 2 |
| Split list among shoppers (each gets a subset) | Planned — Phase 2 |
| Recipe store with "add to list" | Planned — Phase 3 |
| Weekly meal planner → auto-generate shopping list | Planned — Phase 3 |
| Item categorization & aisle grouping | Planned — Phase 3 |
| Estimated total cost tracking | Planned — Phase 3 |
| Barcode scanner to pre-fill item names | Planned — Phase 4 |
| Geofence reminders near stores | Planned — Phase 4 |
| Home screen widget (iOS & Android) | Planned — Phase 4 |

See [`BACKLOG.md`](./BACKLOG.md) for the full roadmap with details.

---

## Repository

This is a monorepo:

| Directory | Description | Status |
|-----------|-------------|--------|
| [`mobile/`](./mobile) | Expo/React Native app — iOS, Android | Active |
| `backend/` | REST API server | Planned |

---

## Getting started

```bash
cd mobile
npm install
npm start        # Expo dev menu — choose iOS or Android
npm run ios      # iOS simulator
npm run android  # Android emulator
```

Requires [Node.js](https://nodejs.org) and the [Expo CLI](https://docs.expo.dev/get-started/installation/).

---

## Tech stack

| Layer | Library |
|-------|---------|
| Framework | Expo ~54 + React Native |
| Language | TypeScript (strict) |
| Routing | Expo Router (file-based) |
| State | Zustand + Immer |
| Storage | AsyncStorage |
| Animations | React Native Reanimated + Gesture Handler |
| Drag & drop | react-native-draggable-flatlist |
| Notifications | Sonner Native |
| HTTP client | Axios (with token refresh interceptor) |
