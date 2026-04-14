# Auth Integration Design

**Date:** 2026-04-14
**Scope:** Integrate signup/login/logout into the Groceroute mobile app without blocking unauthenticated use.

---

## Overview

Users can use the app without an account (data lives in AsyncStorage). Auth is optional and accessible via a new Account tab. When a user logs in or signs up, tokens are stored in SecureStore and the app continues working with local data as before. Data sync between local and server is out of scope for this iteration.

---

## 1. API Change — Signup Returns Tokens

**Current behavior:** `POST /auth/signup` returns HTTP 201 with no body.

**New behavior:** `POST /auth/signup` returns HTTP 201 with `{ token, refreshToken }` — the same shape as `POST /auth/login`.

**Implementation:**
- `AuthService.signUp()` calls `this.login(user)` after creating the user and returns the result.
- `AuthController.signUp()` returns the value from `authService.signUp()` instead of `void`.

No new endpoints, no database schema changes.

---

## 2. Mobile — Auto-Login After Signup

**Current behavior:** `AuthContext.signup()` fires the mutation and returns void. The signup screen redirects to `/(auth)/login` with a toast.

**New behavior:**
- `AuthContext.signup()` receives `{ token, refreshToken }` from the API and calls `tokenService.setTokens()`, mirroring the login flow.
- The signup screen's `onSubmit` navigates to `/(app)` and shows a welcome toast, bypassing the login screen entirely.

---

## 3. Account Tab

A new tab is added to the bottom tab bar at `mobile/app/(app)/(tabs)/account/index.tsx`. The `AppLayout` (`mobile/app/(app)/(tabs)/_layout.tsx`) gets a second `<Tabs.Screen>` entry for it.

### Logged-out state

- A prompt section with copy such as "Sign in to sync your lists across devices"
- Two buttons: **Sign in** and **Create account** — each opens the respective `(auth)` screen as a modal
- An **App Settings** section below (accessible without an account)

### Logged-in state

- **Account section:** user's email (read-only), **Sign out** button (destructive style)
- **App Settings section:** same as logged-out

### App Settings content (initial)

- **Theme:** three-way toggle — Light / Dark / System

---

## 4. Auth Screens as Modals

The existing `(auth)/login` and `(auth)/signup` screens are reused without changes to their form logic.

When triggered from the Account tab, they are presented as **modals** (slide-up sheet) using Expo Router's `presentation: 'modal'` configuration. After a successful login or signup, the modal is dismissed programmatically and the user lands back on the Account tab in the logged-in state.

When triggered from the Account tab context, a dismiss/close button is shown so the user can cancel without completing auth.

---

## 5. Navigation & Routing

- `mobile/app/index.tsx` continues to redirect unconditionally to `/(app)/(tabs)/lists` — no auth gate at the entry point.
- The `(auth)` group remains as-is for its own layout; modal presentation is handled via the navigation call from the Account tab.
- After login (from the login screen's existing flow), `router.navigate("/(app)")` already works correctly.
- After signup (new flow), same navigation target.

---

## Out of Scope

- Data sync between AsyncStorage and the server
- Display name or profile editing
- Password reset / forgot password
- Push notification settings
