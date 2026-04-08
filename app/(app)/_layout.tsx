import { useGroceryListStore } from "@/store/groceryListStore";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const AppLayout = () => {
  const { hydrate, hydrated } = useGroceryListStore();

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrate, hydrated]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Lists",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={"list"} size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="other"
          options={{
            title: "Other",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={"today-outline"} size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default AppLayout;
