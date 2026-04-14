import { ThemedView } from "@/components/themed-view";
import { Stack } from "expo-router";

const AccountLayout = () => {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ThemedView>
  );
};

export default AccountLayout;
