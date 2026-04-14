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
