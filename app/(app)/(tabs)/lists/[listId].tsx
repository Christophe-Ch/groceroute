import EditList from "@/components/list/edit-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useLocalSearchParams } from "expo-router";

type ListScreenParams = {
  listId: string;
};

const ListScreen = () => {
  const { listId } = useLocalSearchParams<ListScreenParams>();
  const { lists } = useGroceryListStore();

  const list = lists[listId];

  if (!list) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText>List not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, paddingBlock: 20 }}>
      <EditList list={list} />
    </ThemedView>
  );
};

export default ListScreen;
