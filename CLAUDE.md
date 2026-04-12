# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a monorepo. Packages live in subdirectories:

- **`mobile/`** — Expo/React Native app (iOS, Android, Web)
- **`backend/`** — API server (planned)

## Project Overview

**Groceroute** is a cross-platform mobile application for managing grocery lists, built with Expo and React Native. It runs on iOS, Android, and Web platforms.

## Tech Stack

- **Framework**: Expo ~54 with Expo Router for file-based routing
- **Language**: TypeScript (strict mode enabled)
- **UI**: React Native with React 19
- **State Management**: Zustand + Immer for immutable state updates
- **Storage**: AsyncStorage for local persistence
- **Forms**: React Hook Form
- **Async Operations**: React Query (@tanstack/react-query)
- **Notifications**: Sonner Native (toast messages)
- **Gestures & Animations**: React Native Gesture Handler, Reanimated
- **Drag & Drop**: react-native-draggable-flatlist
- **Linting**: ESLint with eslint-config-expo

## Common Commands

Run all commands from `mobile/`:

```bash
cd mobile
npm start          # Start the Expo dev server (shows menu for iOS/Android/Web)
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run on web browser
npm lint           # Run ESLint checks
npm run reset-project  # Reset to a fresh project state
```

## Project Structure

All paths below are relative to `mobile/`.

### Routing & Navigation
- **`app/`**: File-based routing using Expo Router
  - **`(auth)/`**: Unauthenticated routes (login, signup)
  - **`(app)/`**: Protected routes for authenticated users
    - **`(tabs)/`**: Tab-based navigation layout
      - **`lists/`**: Grocery lists management
        - `index.tsx` - Lists overview
        - `[listId].tsx` - Individual list details

### State Management
- **`store/grocery-list.store.ts`**: Central Zustand store for app state
  - Manages grocery lists with CRUD operations
  - Each action syncs state to AsyncStorage via `storageService`
  - Uses `produce()` from Immer for immutable updates

### Services
- **`services/storage.service.ts`**: AsyncStorage wrapper
  - `hydrate()` - Load all lists from device storage on app start
  - `persistList(list)` - Save or update a list
  - `deleteList(id)` - Remove a list from storage
  - Uses a simple index pattern: `lists:index` stores IDs, `lists:${id}` stores each list

- **`services/token.service.ts`**: Authentication token management

### Data Models
- **`models/grocery/`**: Type definitions for GroceryList and GroceryItem
- **`models/auth/`**: Type definitions for auth responses

### Components
- **`components/list/`**: List-specific components
  - `create-list.tsx` - Form to create new lists
  - `list-card/` - Card component displaying list summary with actions
- **`components/item/`**: Item-specific components
- **`components/themed-*`**: Themed wrappers (Button, Input, Text, View, Icon)
- **`components/ui/`**: Low-level UI utilities (IconSymbol for cross-platform icon support)

### Hooks
- **`hooks/auth/`**: Auth-related hooks (useAuth, useAuthMutations)
- **`hooks/ui/`**: UI utilities (useColorScheme, useThemeColor) with platform-specific handling (`.web.ts` files)

### Contexts
- **`contexts/authContext.tsx`**: React Context for authentication state

## Architecture Patterns

### Store Hydration
The app hydrates the Zustand store on app launch via the AppLayout component:
```typescript
// mobile/app/(app)/(tabs)/_layout.tsx
const { hydrate, hydrated } = useGroceryListStore();
useEffect(() => {
  if (!hydrated) hydrate();
}, [hydrate, hydrated]);
```

### Async State Updates
Store actions are async and follow this pattern:
1. Update in-memory state immediately with `set(produce(...))`
2. Persist to storage via `storageService`
3. No error handling - assumes operations succeed (add try-catch if backend integration needed)

### Component Theming
Use `useThemeColor()` hook to access theme-aware colors. Platform-specific behavior is handled via `.web.ts` file variants.

## TypeScript Configuration

- **Strict mode**: Enabled (`"strict": true`)
- **Path alias**: `@/*` resolves to root directory
- Extends Expo's base tsconfig for React Native compatibility

## ESLint Configuration

Uses Expo's ESLint config with the flat config format. Ignores the `dist/` directory.

## Key Dependencies to Know

- **Immer**: Used in all store actions for safe immutable updates
- **Zustand**: Global state management with minimal boilerplate
- **AsyncStorage**: Device storage (persists across app restarts)
- **Expo Router**: Dynamic file-based routing (similar to Next.js)
- **React Query**: Manages async state (currently imported but may not be heavily used)

## Notes for Future Development

1. **No backend integration yet**: The app uses only AsyncStorage. Prepare for API integration by wrapping fetch calls in the store or services.
2. **Error handling**: Current code assumes operations succeed. Add try-catch blocks when adding real API calls.
3. **Auth flow**: Basic auth structure is in place (AuthContext, auth hooks). Integrate token storage via `tokenService`.
4. **Drag & drop**: Already imported; items can be reordered using `reorderItems()` action in the store.
5. **TypeScript**: All code uses strict TypeScript. Maintain this standard.
