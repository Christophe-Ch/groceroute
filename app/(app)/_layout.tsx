import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const AppLayout = () => {
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
