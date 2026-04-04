import { useAuth } from "@/hooks/auth/use-auth";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AppLayout = () => {
  const { token, isLoading } = useAuth();

  if (!token) return <Redirect href="/(auth)/login" />;

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
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
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

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  headerButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "red",
    alignSelf: "center",
  },
});
