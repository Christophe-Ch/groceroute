import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/auth/use-auth";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

const decodeEmail = (jwt: string): string | null => {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    // The API sets sub to the user's email (see auth.service.ts)
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
        <ThemedText type="title" style={{ paddingBlock: 20 }}>
          Account
        </ThemedText>
        <View style={styles.section}>
          <ThemedText type="muted">Signed in as</ThemedText>
          <ThemedText type="defaultSemiBold">{email}</ThemedText>
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
