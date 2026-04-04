import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/ui/use-theme-color";
import { Redirect, Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../hooks/auth/use-auth";

const AuthLayout = () => {
  const { token, isLoading } = useAuth();
  const backgroundColor = useThemeColor({}, "background");

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (token) {
    return <Redirect href="/(app)" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </SafeAreaView>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
});
