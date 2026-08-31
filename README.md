# 🛒 Groceroute

A cross-platform grocery list app that makes shopping smarter. Build lists, let the app figure out the most efficient order to pick items up, and check them off as you go — together with others or on your own. 🧠🛍️

Runs on **iOS** 📱 and **Android** 🤖 from a single codebase.

---

## ✨ Features

### 📝 Lists
Create as many grocery lists as you need — weekly shop, party prep, meal prep, anything. Lists live on your device and sync to the backend, so they follow you across devices.

### ➕ Adding items
Add items with names and quantities. As you type, the app suggests items you've added before, so repeat staples are a single tap. Rename items, adjust quantities, remove them individually, or delete an entire list when you're done.

### ✋ Drag & drop reordering
In edit mode, hold and drag any item to rearrange the list exactly the way you want it.

### ▶️ Play mode
Tap **Play** to start a shopping session. The app automatically reorders your items using a distance-based algorithm — items you tend to pick up in sequence stay grouped together, minimizing backtracking through the store.

During play mode:
- 👆 Tap an item to check it off
- 📊 A progress bar shows how much of the list is done
- ✅ Checked items visually separate from remaining ones
- 🏁 Finish the session to feed the result back into the learning graph, or abandon it to restore the list

### 🧠 Check-order learning
The app tracks the order in which you check items off during each session. Over time, it builds a graph of which items you pick up near each other and uses that to sort your list more accurately on future runs.

### 🤝 Shared lists & real-time sync
Share a list by showing its **QR code** — anyone who scans it joins instantly, no ID to type. Collaborators see the same items and edits in real time, streamed over a live SSE connection and reconciled through an operation-based sync engine.

### 👥 Split the shop
Starting a session, pick who's shopping. The list is divided between the participants, and each shopper swipes to their own subset — everyone's checks land on the same shared list.

### 📴 Offline-first
Everything works without a network connection. Data is stored on-device and loads instantly on app start. Changes made offline are queued as operations and replayed to the backend once you're reconnected — including operations missed while the live stream was down.

---

## 🚀 What's coming

| Feature | Status |
|---------|--------|
| Backend sync & multi-device | ✅ Shipped |
| Shared lists & join by QR code | ✅ Shipped |
| Live real-time sync across collaborators | ✅ Shipped |
| Split list among shoppers | ✅ Shipped |
| Shopping timer to track how long each session takes | Planned |
| Recipe store with "add to list" | Planned |
| Weekly meal planner → auto-generate shopping list | Planned |
| Estimated total cost tracking | Planned |

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

**API** 🔌

```bash
cp .env.template .env   # fill in POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB
docker-compose up       # API + PostgreSQL + Adminer, from the repo root
# API:     http://localhost:3000
# Adminer: http://localhost:8080
```

Migrations run automatically on start. See [`api/README.md`](./api/README.md) for entities, migrations and route guards.

**Mobile app** 📱

```bash
cd mobile
npm install
cp .env.local.template .env.local   # set EXPO_PUBLIC_API_BASE_URL to your API
npm run ios       # build & run on the iOS simulator
npm run android   # build & run on the Android emulator
npm start         # dev server only, once a build is installed
```

The app uses native modules (camera, secure store, updates), so it runs on a **development build** — `npm run ios` / `npm run android` compile one, they don't use Expo Go. Requires [Node.js](https://nodejs.org) and Xcode / Android Studio.

---

## 🛠️ Tech stack

### 📱 Mobile (`mobile/`)

| Layer | Library |
|-------|---------|
| Framework | Expo ~57 + React Native 0.86 (React 19) |
| Language | TypeScript (strict) |
| Routing | Expo Router (file-based) |
| State | Zustand + Immer |
| Sync | Operation log + SSE (`react-native-sse`), NetInfo for connectivity |
| Storage | AsyncStorage (lists) + Expo SecureStore (tokens) |
| Animations | React Native Reanimated + Gesture Handler |
| Drag & drop | react-native-draggable-flatlist |
| QR codes | expo-camera + react-native-qrcode-svg |
| Forms | React Hook Form |
| Notifications | Sonner Native |
| HTTP client | Axios (with token refresh interceptor) |
| Distribution | EAS Build + EAS Update (development / preview / production channels) |

### 🔌 API (`api/`)

| Layer | Library |
|-------|---------|
| Framework | NestJS 11 |
| Language | TypeScript (strict) |
| Database | PostgreSQL via TypeORM |
| Auth | Passport.js — Local + JWT access/refresh |
| Sync | `/sync` push / pull / SSE stream, operations replayed through projectors |
| Events | @nestjs/event-emitter |
| Validation | class-validator + class-transformer |
| Tests | Jest (unit + e2e) |

---

## 🚢 Deployment

The API deploys to **Google Cloud Run** (region `europe-west9`). Pushing to `main` with changes under `api/` triggers [`.github/workflows/api.dev.yml`](./.github/workflows/api.dev.yml), which lints, runs the tests, builds the image to Artifact Registry, runs migrations as a Cloud Run job, then rolls out a new revision.
