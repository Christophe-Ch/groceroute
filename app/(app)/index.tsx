import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/auth/use-auth";

const Index = () => {
  const { logout } = useAuth();

  return (
    <ThemedView style={{ flex: 1, padding: 20 }}>
      <ThemedText>Welcome!</ThemedText>
      <ThemedButton text="Log out" onPress={logout} />
    </ThemedView>
  );
};

export default Index;
