import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useGroceryListStore } from "@/store/groceryListStore";

const Index = () => {
  const { lists, hydrated, createList } = useGroceryListStore();

  if (!hydrated) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  function create() {
    createList("New List " + (Object.keys(lists).length + 1));
  }

  return (
    <ThemedView style={{ flex: 1, padding: 20 }}>
      <ThemedText type="title">My lists</ThemedText>
      {Object.values(lists).map((list) => (
        <ThemedText key={list.id}>{list.name}</ThemedText>
      ))}
      <ThemedButton text="Create" onPress={create} />
    </ThemedView>
  );
};

export default Index;
