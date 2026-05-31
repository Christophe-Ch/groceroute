import EditList from "@/components/list/edit-list";
import PlayList from "@/components/list/play-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { orderItems } from "@/domain/grocery/distance";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

type ListScreenParams = {
  listId: string;
};

const ListScreen = () => {
  const { listId } = useLocalSearchParams<ListScreenParams>();
  const list = useGroceryListStore((s) => s.lists[listId]);
  const startShopping = useGroceryListStore((s) => s.startShopping);
  const reorderItems = useGroceryListStore((s) => s.reorderItems);

  const onStartShopping = useCallback(async () => {
    if (!list) return;
    const orderedItems = orderItems(list.items, list.distances);
    await reorderItems(list.id, orderedItems);
    startShopping(list.id);
  }, [list, reorderItems, startShopping]);

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
        <EditList list={list} onModeChange={onStartShopping} />
      ) : (
        <PlayList list={list} />
      )}
    </ThemedView>
  );
};

export default ListScreen;
