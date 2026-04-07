import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const Index = () => {
  return (
    <ThemedView style={{ flex: 1, padding: 20 }}>
      <ThemedText type="title">My lists</ThemedText>
    </ThemedView>
  );
};

export default Index;
