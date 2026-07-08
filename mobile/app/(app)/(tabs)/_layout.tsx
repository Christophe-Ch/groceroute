import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/auth/use-auth";
import { useSync } from "@/hooks/sync/use-sync";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AppLayout = () => {
  const { token } = useAuth();
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
