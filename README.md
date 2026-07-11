# 🛒 Groceroute

A cross-platform grocery list app that makes shopping smarter. Build lists, let the app figure out the most efficient order to pick items up, and check them off as you go — together with others or on your own. 🧠🛍️

Runs on **iOS** 📱 and **Android** 🤖 from a single codebase.

---

## ✨ Features

### 📝 Lists
Create as many grocery lists as you need — weekly shop, party prep, meal prep, anything. Lists are saved locally on your device and persist across app restarts.

### ➕ Adding items
Add items with names and quantities. As you type, the app suggests items you've added before, so repeat staples are a single tap. Remove items individually or delete an entire list when you're done.

### ✋ Drag & drop reordering
In edit mode, hold and drag any item to rearrange the list exactly the way you want it.

### ▶️ Play mode
Tap **Play** to start a shopping session. The app automatically reorders your items using a distance-based algorithm — items you tend to pick up in sequence stay grouped together, minimizing backtracking through the store.

During play mode:
- 👆 Tap an item to check it off
- 📊 A progress bar shows how much of the list is done
- ✅ Checked items visually separate from remaining ones

### 🧠 Check-order learning
The app tracks the order in which you check items off during each session. Over time, it builds a graph of which items you pick up near each other and uses that to sort your list more accurately on future runs.

### 🤝 Shared lists & real-time sync
Lists sync to the backend so they follow you across devices. Share a list by sending its ID — anyone who joins sees the same items and edits in real time, streamed over a live connection and reconciled through an operation-based sync engine.

### 📴 Offline-first
Everything works without a network connection. All data is stored on-device via AsyncStorage and loads instantly on app start. Changes made offline are queued as operations and replayed to the backend once you're reconnected.

---

## 🚀 What's coming

| Feature | Status |
|---------|--------|
| Backend sync & multi-device | ✅ Shipped |
| Shared lists (join by ID) | ✅ Shipped |
| Live real-time sync across collaborators | ✅ Shipped |
| Join a list via QR code instead of typing the ID | Planned — Phase 2 |
| Shopping timer to track how long each session takes | Planned — Phase 2 |
| Split list among shoppers (each gets a subset) | Planned — Phase 2 |
| Recipe store with "add to list" | Planned — Phase 3 |
| Weekly meal planner → auto-generate shopping list | Planned — Phase 3 |
| Estimated total cost tracking | Planned — Phase 3 |

See [`BACKLOG.md`](./BACKLOG.md) for the full roadmap with details.

---

## 📦 Repository

This is a monorepo:

| Directory | Description | Status |
|-----------|-------------|--------|
| [`mobile/`](./mobile) | Expo/React Native app — iOS, Android | Active |
| [`api/`](./api) | NestJS REST API + PostgreSQL | Active |

---

## 🏁 Getting started

**Mobile app** 📱

```bash
cd mobile
npm install
npm start        # Expo dev menu — choose iOS or Android
npm run ios      # iOS simulator
npm run android  # Android emulator
```

Requires [Node.js](https://nodejs.org) and the [Expo CLI](https://docs.expo.dev/get-started/installation/).

**API** 🔌

```bash
docker-compose up   # API + PostgreSQL + Adminer, from the repo root
# API:     http://localhost:3000
# Adminer: http://localhost:8080
```

Environment variables (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) are read from a `.env` file at the repo root.

---

## 🛠️ Tech stack

### 📱 Mobile (`mobile/`)

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

### 🔌 API (`api/`)

| Layer | Library |
|-------|---------|
| Framework | NestJS 11 |
| Language | TypeScript (strict) |
| Database | PostgreSQL via TypeORM |
| Auth | Passport.js — Local + JWT access/refresh |
| Validation | class-validator + class-transformer |
