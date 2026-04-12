# Security Audit — 2026-04-11

## Summary

The app's overall security posture is **moderate**. The most important positive finding is that authentication tokens are correctly stored in `expo-secure-store` (hardware-backed encrypted storage) rather than plain AsyncStorage. The primary risks stem from: (1) the auth guard being effectively absent — protected routes are reachable without a token; (2) the raw `token` string being held in React state and propagated through Context, creating an unnecessary in-memory copy of the access token; (3) raw server error messages being surfaced directly to the UI on signup; and (4) a token refresh loop risk in the axios interceptor. The app has no live backend yet, which limits current exploitability, but the auth flow has structural issues that must be resolved before a backend is wired up.

---

## Critical Vulnerabilities

### 1. No Authentication Guard on Protected Routes

**Files:** `app/index.tsx` (line 4), `app/(app)/(tabs)/_layout.tsx`

`app/index.tsx` unconditionally redirects every user to `/(app)/(tabs)/lists` regardless of auth state. Neither `app/(app)/(tabs)/_layout.tsx` nor any wrapping layout reads the `token` or `isLoading` from `AuthContext` to enforce access control. A user with no stored token is deposited directly into the protected area.

**Risk:** All UI in the `(app)` segment is accessible without authentication. When the backend is live, the 401 interceptor eventually clears tokens, but there is a race window and no structural guarantee.

**Recommended fix:** Add or modify `app/(app)/_layout.tsx` to redirect unauthenticated users:
```tsx
const { token, isLoading } = useAuth();
if (isLoading) return <SplashScreen />;
if (!token) return <Redirect href="/(auth)/login" />;
return <Slot />;
```

---

### 2. Access Token Stored in Plain React State / Context

**File:** `contexts/authContext.tsx` (lines 5, 19, 23–26, 48)

After retrieval from `SecureStore`, the raw access token string is placed into `useState<string | null>` and passed as a value on `AuthContext`. Every component calling `useAuth()` holds a reference to the raw token string.

**Risk:** The token is visible in React DevTools (debug builds), broadens the in-memory attack surface, and is unnecessary — the `tokenService` singleton and the axios interceptor already handle the token without exposing it to the UI layer.

**Recommended fix:** Replace `token: string | null` in the context type with `isAuthenticated: boolean`. The `tokenService.subscribeToken` callback should set a boolean flag rather than the raw token string.

---

## Moderate Risks

### 3. Raw Server Error Message Rendered to the UI

**File:** `app/(auth)/signup.tsx` (line 38)

```tsx
toast.error(e.response?.data.message);
```

The API error body's `message` field is passed verbatim to the toast without validation. A misbehaving backend could send internal details (stack traces, table names, service names).

**Risk:** Information disclosure via server-controlled strings rendered in the UI.

**Recommended fix:** Use a generic user-facing message; forward the raw error to a crash reporter instead:
```tsx
toast.error("An error has occurred, please try again later.");
```

---

### 4. `API_BASE_URL` Not Validated — No HTTPS Enforcement

**Files:** `app.config.ts` (lines 7–9), `api/client.ts` (line 7)

`Constants.expoConfig?.extra?.API_BASE_URL` is read with no validation. If absent or set to an `http://` URL, the app silently misbehaves or sends credentials over cleartext.

**Risk:** Silent misconfiguration; potential cleartext credential transmission.

**Recommended fix:**
```ts
const baseURL = Constants.expoConfig?.extra?.API_BASE_URL;
if (!baseURL || !baseURL.startsWith("https://")) {
  throw new Error(`Invalid API_BASE_URL: "${baseURL}"`);
}
export const client = axios.create({ baseURL });
```

---

### 5. ✅ Predictable / Collision-Prone ID Generation Using `Date.now()`

**File:** `store/grocery-list.store.ts` (lines 40, 86)

```ts
id: "list-" + Date.now()
id: "item-" + Date.now()
```

Two items created within the same millisecond receive identical IDs, causing a silent overwrite in the store.

**Risk:** Data loss for rapid item creation.

**Recommended fix:** Use `crypto.randomUUID()` (available in Hermes/Expo) or `expo-crypto`'s `randomUUID()`.

---

### 6. Token Refresh Interceptor Can Loop on Refresh Endpoint 401

**File:** `api/client.ts` (lines 25–49)

The `_retry` flag is set on `originalRequest`, not on the refresh request itself. If `/auth/refresh` returns a 401, the interceptor fires again on that request, finds `_retry` unset, and re-enters the refresh flow.

**Risk:** Infinite loop or cascading failures before tokens are eventually cleared.

**Recommended fix:** Perform the refresh call using a separate bare `axios` instance (not `client`) so the interceptor does not apply to it:
```ts
const refreshResponse = await axios.post<AuthResponse>(
  `${client.defaults.baseURL}/auth/refresh`,
  { refreshToken }
);
```

---

## Low / Informational

### 7. Deep Link Scheme Is the Template Default

**File:** `app.json` (line 8): `"scheme": "reactnativetemplate"`

The scheme is unchanged from the Expo project template. While URI scheme hijacking is harder on iOS, Android allows any app to register any scheme. A malicious app registering the same scheme could intercept deep links.

**Recommended fix:** Change to `"scheme": "groceroute"`.

---

### 8. No Input Length Validation for Item Names

**File:** `components/item/edit-item-row.tsx`, `store/grocery-list.store.ts` (lines 84–101)

List names are capped at 20 characters in the UI (`maxLength={20}`), but item names have no length limit in the UI or the store. Arbitrarily long strings are written to AsyncStorage.

**Recommended fix:** Add `maxLength` to the item name `ThemedInput` and a length check in `addItem`.

---

### 9. No Password Minimum Length on Signup

**File:** `app/(auth)/signup.tsx` (lines 72–77)

The signup form validates only presence and match, not minimum length.

**Recommended fix:** Add `minLength: { value: 8, message: "Password must be at least 8 characters." }` to the password field rules.

---

### 10. `expo-updates` Not Configured — Document as Future Prerequisite

**File:** `app.json`

No `eas.json` exists and `expo-updates` is not configured. OTA updates are not an active risk. However, before enabling EAS Update, code signing must be configured to prevent unsigned update injection.

---

### 11. Single Token Listener Slot — Fragile Observable

**File:** `services/token.service.ts` (lines 33–35)

`subscribeToken` stores only one listener; a second call silently drops the first. This is safe today with a single `AuthProvider`, but is fragile.

**Recommended fix:** Use a `Set<TokenListener>` and return an unsubscribe function.

---

### 12. `.env.local.template` Has Empty Value; `dotenv` Not in `devDependencies`

**File:** `.env.local.template`, `package.json`

The template ships with `API_BASE_URL=`, which means a developer cloning the repo can build with a silent empty base URL. `dotenv` is also pulled in transitively through `expo` rather than declared explicitly.

**Recommended fix:** Add a comment or example value to the template. Add `dotenv` to `devDependencies`.

---

## Recommendations Table (Ordered by Severity)

| # | Severity | Action | Location |
|---|----------|--------|----------|
| 1 | Critical | Add auth guard layout redirecting unauthenticated users to login | `app/(app)/_layout.tsx` |
| 2 | Critical | Remove raw token string from Context; expose `isAuthenticated: boolean` only | `contexts/authContext.tsx` |
| 3 | Moderate | Do not surface `e.response?.data.message` in toast — use a generic message | `app/(auth)/signup.tsx:38` |
| 4 | Moderate | Validate `API_BASE_URL` at startup; assert `https://` scheme | `api/client.ts:7`, `app.config.ts` |
| 5 | ✅ Moderate | Replace `Date.now()` IDs with `crypto.randomUUID()` | `store/grocery-list.store.ts:40,86` |
| 6 | Moderate | Use a separate axios instance for the token refresh request to prevent 401 loop | `api/client.ts:38` |
| 7 | Low | Change deep link scheme from `reactnativetemplate` to `groceroute` | `app.json:8` |
| 8 | Low | Add `maxLength` to item name input and store validation | `edit-item-row.tsx`, `grocery-list.store.ts` |
| 9 | Low | Add minimum password length rule to signup form | `app/(auth)/signup.tsx` |
| 10 | Low | Refactor `subscribeToken` to use a `Set` and return an unsubscribe function | `services/token.service.ts` |
| 11 | Informational | Document code-signing requirements before enabling `expo-updates` / EAS Update | `app.json` |
| 12 | Informational | Add value guidance to `.env.local.template`; add `dotenv` to `devDependencies` | `.env.local.template`, `package.json` |
