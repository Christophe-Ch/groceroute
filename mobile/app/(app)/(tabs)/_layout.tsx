import { Colors } from "@/constants/theme";
import { useSync } from "@/hooks/sync/use-sync";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useGroceryListStore } from "@/stores/groceries/grocery-list.store";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "@/hooks/ui/use-color-scheme";
import { SafeAreaView } from "react-native-safe-area-context";

const AppLayout = () => {
  const token = useAuthStore((s) => s.token);
  useSync(token);

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
