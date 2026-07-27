import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthStore } from "@/stores/auth/auth.store";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

const AccountScreen = () => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);

  if (currentUser) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={{ paddingBlock: 20 }}>
          Account
        </ThemedText>
        <View style={styles.section}>
          <ThemedText type="muted">Signed in as</ThemedText>
          <ThemedText type="defaultSemiBold">{currentUser.email}</ThemedText>
        </View>
        <ThemedButton text="Sign out" onPress={logout} style={styles.button} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={{ paddingTop: 20 }}>
        Account
      </ThemedText>
      <View style={styles.authPrompt}>
        <ThemedText type="subtitle">
          Sign in to sync your lists across devices
        </ThemedText>
        <ThemedButton
          text="Sign in"
          onPress={() => router.push("/(auth)/login")}
          style={styles.button}
        />
        <ThemedButton
          text="Create account"
          onPress={() => router.push("/(auth)/signup")}
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
