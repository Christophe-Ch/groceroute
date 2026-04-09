import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const ListScreen = () => {
  return (
    <ThemedView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <ThemedText>List screen</ThemedText>
    </ThemedView>
  );
};

export default ListScreen;
