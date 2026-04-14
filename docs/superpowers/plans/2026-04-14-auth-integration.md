# Auth Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate optional login/signup into the Groceroute mobile app via a new Account tab, without blocking unauthenticated use.

**Architecture:** The API's `signUp` endpoint is updated to return tokens (same shape as `login`), enabling auto-login on the client. The mobile root layout switches from `<Slot>` to `<Stack>` so `(auth)` screens can be presented as modals. A new Account tab shows a login prompt when logged out and email + logout when logged in.

**Tech Stack:** NestJS (API), Expo Router v4, React Native, Zustand, SecureStore, Axios

---

## File Map

**API — modified:**
- `api/src/auth/services/auth.service.ts` — `signUp()` returns `LoginResponse` by calling `login()` after user creation
- `api/src/auth/controllers/auth.controller.ts` — return the `LoginResponse` from `signUp`
- `api/src/auth/services/auth.service.spec.ts` — test that `signUp` returns token + refreshToken

**Mobile — modified:**
- `mobile/api/auth.ts` — `signup()` return type changes from `Promise<void>` to `Promise<AuthResponse>`
- `mobile/contexts/authContext.tsx` — `signup()` calls `tokenService.setTokens()` with returned tokens
- `mobile/app/_layout.tsx` — replace `<Slot>` with `<Stack>`, configure `(auth)` group as modal
- `mobile/app/(auth)/login.tsx` — replace `router.navigate("/(app)")` with `router.dismiss()`
- `mobile/app/(auth)/signup.tsx` — call `router.dismiss()` after auto-login, update toast
- `mobile/app/(app)/(tabs)/_layout.tsx` — add `<Tabs.Screen name="account" …>`

**Mobile — created:**
- `mobile/app/(app)/(tabs)/account/index.tsx` — Account tab screen

---

## Task 1: API — signUp Returns Tokens

**Files:**
- Modify: `api/src/auth/services/auth.service.ts`
- Modify: `api/src/auth/controllers/auth.controller.ts`
- Modify: `api/src/auth/services/auth.service.spec.ts`

- [ ] **Step 1: Write the failing test**

Replace the contents of `api/src/auth/services/auth.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@users/models/user.entity';
import { BadRequestException } from '@nestjs/common';

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  password: 'hashed',
  refreshToken: null,
} as User;

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('returns token and refreshToken after creating the user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockUsersService.update.mockResolvedValue(undefined);
      mockJwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.signUp({
        email: 'test@example.com',
        password: 'Password1!',
      });

      expect(result).toHaveProperty('token', 'access-token');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.refreshToken).toBe('string');
    });

    it('throws BadRequestException when email is already taken', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.signUp({ email: 'test@example.com', password: 'Password1!' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd api && npm test -- --testPathPattern=auth.service.spec
```

Expected: FAIL — `signUp` currently returns `void`, not an object with `token` and `refreshToken`.

- [ ] **Step 3: Update `AuthService.signUp` to return `LoginResponse`**

In `api/src/auth/services/auth.service.ts`, change the `signUp` method:

```typescript
public async signUp(signUpDto: SignUpDto): Promise<LoginResponse> {
  const user = await this.usersService.findByEmail(signUpDto.email);
  if (user) {
    throw new BadRequestException(
      'This email address is already associated to an account.',
    );
  }

  const created = await this.usersService.create(
    signUpDto.email,
    bcrypt.hashSync(signUpDto.password, 10),
  );

  return this.login(created);
}
```

- [ ] **Step 4: Update `AuthController.signUp` to return the response**

In `api/src/auth/controllers/auth.controller.ts`, change the `signUp` method (remove the `void` implicit return):

```typescript
@Post('signup')
@HttpCode(HttpStatus.CREATED)
async signUp(@Body() signUpDto: SignUpDto) {
  return await this.authService.signUp(signUpDto);
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
cd api && npm test -- --testPathPattern=auth.service.spec
```

Expected: PASS — both `signUp` tests green.

- [ ] **Step 6: Commit**

```bash
cd api
git add src/auth/services/auth.service.ts src/auth/controllers/auth.controller.ts src/auth/services/auth.service.spec.ts
git commit -m "feat: return tokens from signup endpoint"
```

---

## Task 2: Mobile API Layer — signup Return Type

**Files:**
- Modify: `mobile/api/auth.ts`

- [ ] **Step 1: Update the signup function signature**

In `mobile/api/auth.ts`, change `signup` to return `AuthResponse`:

```typescript
import { AuthResponse } from "@/models/auth";
import { client } from "./client";

export const login = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>("/auth/login", {
    email,
    password,
  });

  return data;
};

export const signup = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>("/auth/signup", {
    email,
    password,
  });

  return data;
};
```

- [ ] **Step 2: Commit**

```bash
cd mobile
git add api/auth.ts
git commit -m "feat: update signup API return type to AuthResponse"
```

---

## Task 3: Mobile AuthContext — Signup Stores Tokens

**Files:**
- Modify: `mobile/contexts/authContext.tsx`

- [ ] **Step 1: Update `signup` to store tokens**

Replace the `signup` function in `mobile/contexts/authContext.tsx`. The full file after the change:

```typescript
import { useLogin, useSignup } from "@/hooks/auth/use-auth-mutations";
import { tokenService } from "@/services/token.service";
import { createContext, ReactNode, useEffect, useState } from "react";

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = tokenService.subscribeToken(setToken);
    tokenService.getAccessToken().then((token) => {
      setToken(token);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginMutation = useLogin();
  const login = async (email: string, password: string) => {
    const { token, refreshToken } = await loginMutation.mutateAsync({
      email,
      password,
    });

    await tokenService.setTokens(token, refreshToken);
  };

  const signupMutation = useSignup();
  const signup = async (email: string, password: string) => {
    const { token, refreshToken } = await signupMutation.mutateAsync({
      email,
      password,
    });

    await tokenService.setTokens(token, refreshToken);
  };

  const logout = async () => {
    await tokenService.clearTokens();
  };

  return (
    <AuthContext value={{ token, login, logout, signup, isLoading }}>
      {children}
    </AuthContext>
  );
};
```

- [ ] **Step 2: Commit**

```bash
cd mobile
git add contexts/authContext.tsx
git commit -m "feat: auto-login after signup by storing tokens in AuthContext"
```

---

## Task 4: Mobile Root Layout — Stack with Modal Auth

**Files:**
- Modify: `mobile/app/_layout.tsx`

- [ ] **Step 1: Replace `<Slot>` with `<Stack>` and configure `(auth)` as modal**

Replace the contents of `mobile/app/_layout.tsx`:

```typescript
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/ui/use-color-scheme";
import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import { AuthProvider } from "../contexts/authContext";

const client = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background");

  return (
    <GestureHandlerRootView style={{ backgroundColor, flex: 1 }}>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack screenOptions={{ headerShown: false, animation: "none" }}>
              <Stack.Screen
                name="(auth)"
                options={{ presentation: "modal" }}
              />
            </Stack>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd mobile
git add app/_layout.tsx
git commit -m "feat: use Stack at root to support modal auth presentation"
```

---

## Task 5: Mobile Auth Screens — Dismiss Modal After Success

**Files:**
- Modify: `mobile/app/(auth)/login.tsx`
- Modify: `mobile/app/(auth)/signup.tsx`

- [ ] **Step 1: Update login screen to dismiss modal on success**

In `mobile/app/(auth)/login.tsx`, change `onSubmit`:

```typescript
const onSubmit = async ({ email, password }: LoginForm) => {
  try {
    await login(email, password);
    router.dismiss();
    toast.success("Welcome back!");
  } catch {
    toast.error("Please check your credentials.");
  }
};
```

- [ ] **Step 2: Update signup screen to dismiss modal and show welcome toast**

In `mobile/app/(auth)/signup.tsx`, change `onSubmit`:

```typescript
const onSubmit = async ({ email, password }: SignupForm) => {
  try {
    await signup(email, password);
    router.dismiss();
    toast.success("Welcome! Your account has been created.");
  } catch (e) {
    if (isAxiosError(e)) {
      toast.error(e.response?.data.message);
    } else {
      toast.error("An error has occurred, please try again later.");
    }
  }
};
```

- [ ] **Step 3: Commit**

```bash
cd mobile
git add app/\(auth\)/login.tsx app/\(auth\)/signup.tsx
git commit -m "feat: dismiss auth modal after successful login or signup"
```

---

## Task 6: Create Account Tab Screen

**Files:**
- Create: `mobile/app/(app)/(tabs)/account/index.tsx`

- [ ] **Step 1: Create the Account screen**

Create `mobile/app/(app)/(tabs)/account/index.tsx`:

```typescript
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/auth/use-auth";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

const decodeEmail = (jwt: string): string | null => {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return (payload as { sub?: string }).sub ?? null;
  } catch {
    return null;
  }
};

const AccountScreen = () => {
  const { token, logout } = useAuth();

  if (token) {
    const email = decodeEmail(token);
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Account</ThemedText>
        <View style={styles.section}>
          <ThemedText type="muted">Signed in as</ThemedText>
          <ThemedText type="defaultSemiBold">{email}</ThemedText>
        </View>
        <ThemedButton
          text="Sign out"
          onPress={logout}
          iconName="log-out-outline"
          iconPosition="right"
          style={styles.button}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Account</ThemedText>
      <View style={styles.authPrompt}>
        <ThemedText type="subtitle">
          Sign in to sync your lists across devices
        </ThemedText>
        <ThemedButton
          text="Sign in"
          onPress={() => router.push("/(auth)/login")}
          iconName="log-in-outline"
          iconPosition="right"
          style={styles.button}
        />
        <ThemedButton
          text="Create account"
          onPress={() => router.push("/(auth)/signup")}
          iconName="rocket-outline"
          iconPosition="right"
          style={styles.button}
        />
      </View>
    </ThemedView>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    gap: 24,
  },
  section: {
    gap: 4,
  },
  authPrompt: {
    gap: 16,
  },
  button: {
    alignSelf: "stretch",
  },
});
```

- [ ] **Step 2: Commit**

```bash
cd mobile
git add app/\(app\)/\(tabs\)/account/index.tsx
git commit -m "feat: add Account tab screen with login prompt and profile view"
```

---

## Task 7: Register Account Tab in AppLayout

**Files:**
- Modify: `mobile/app/(app)/(tabs)/_layout.tsx`

- [ ] **Step 1: Add Account tab to the Tabs navigator**

In `mobile/app/(app)/(tabs)/_layout.tsx`, add the Account screen after the existing Lists screen. Full file after the change:

```typescript
import { Colors } from "@/constants/theme";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AppLayout = () => {
  const hydrated = useGroceryListStore((s) => s.hydrated);
  const hydrate = useGroceryListStore((s) => s.hydrate);
  const colorScheme = useColorScheme() ?? "dark";
  const theme = Colors[colorScheme];

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrate, hydrated]);

  if (!hydrated) return null;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.icon,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            borderTopWidth: 1,
          },
        }}
      >
        <Tabs.Screen
          name="lists"
          options={{
            title: "Lists",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={"list"} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={"person-outline"} size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default AppLayout;
```

- [ ] **Step 2: Commit**

```bash
cd mobile
git add app/\(app\)/\(tabs\)/_layout.tsx
git commit -m "feat: register Account tab in AppLayout"
```

---

## Manual Test Checklist

After all tasks are complete, verify in the iOS Simulator (`cd mobile && npm run ios`):

- [ ] App opens directly to the Lists tab (no auth gate)
- [ ] Tapping the Account tab shows the logged-out state with "Sign in" and "Create account" buttons
- [ ] Tapping "Sign in" slides up the login screen as a modal
- [ ] Successful login dismisses the modal and the Account tab shows email + Sign out
- [ ] Tapping "Create account" slides up the signup screen as a modal
- [ ] Successful signup dismisses the modal and Account tab shows the new account's email (auto-login)
- [ ] Tapping "Sign out" clears the session and Account tab returns to the logged-out state
- [ ] The Lists tab continues to work the same before and after login
