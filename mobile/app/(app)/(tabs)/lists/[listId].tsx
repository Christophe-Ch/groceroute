import EditList from "@/components/list/edit-list";
import PlayList from "@/components/list/play-list/play-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useGroceryListStore } from "@/stores/groceries/grocery-list.store";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

type ListScreenParams = {
  listId: string;
};

const ListScreen = () => {
  const { listId } = useLocalSearchParams<ListScreenParams>();
  const list = useGroceryListStore((s) => s.lists[listId]);
  const syncOperations = useGroceryListStore((s) => s.syncOperations);

  useEffect(() => {
    syncOperations(listId).catch((err) =>
      console.error(`Failed to sync list ${listId}`, err),
    );
  }, [listId, syncOperations]);

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
      {list.mode === "edit" ? (
        <EditList list={list} />
      ) : (
        <PlayList list={list} />
      )}
    </ThemedView>
  );
};

export default ListScreen;
