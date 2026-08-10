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
import { SheetProvider } from "@/contexts/sheet-context";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useEffect } from "react";
import { enableMapSet } from "immer";

const client = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = useThemeColor({}, "background");
  const initAuth = useAuthStore((s) => s.init);
  enableMapSet();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <GestureHandlerRootView style={{ backgroundColor, flex: 1 }}>
      <QueryClientProvider client={client}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <SheetProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "none",
                contentStyle: { backgroundColor },
              }}
            >
              <Stack.Screen
                name="(auth)"
                options={{
                  presentation: "modal",
                  animation: "slide_from_bottom",
                }}
              />
            </Stack>
          </SheetProvider>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
