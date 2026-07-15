import EditList from "@/components/list/edit-list";
import PlayList from "@/components/list/play-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { orderItems } from "@/domain/grocery/distance";
import { useAppState } from "@/hooks/app/use-app-state";
import { useAuth } from "@/hooks/auth/use-auth";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";

type ListScreenParams = {
  listId: string;
};

const ListScreen = () => {
  const { token } = useAuth();
  const { listId } = useLocalSearchParams<ListScreenParams>();
  const list = useGroceryListStore((s) => s.lists[listId]);
  const syncOperations = useGroceryListStore((s) => s.syncOperations);
  const startShopping = useGroceryListStore((s) => s.startShopping);
  const reorderItems = useGroceryListStore((s) => s.reorderItems);

  const onStartShopping = useCallback(async () => {
    if (!list) return;
    const orderedItems = orderItems(list.items, list.distances);
    await reorderItems(list.id, orderedItems);
    startShopping(list.id);
  }, [list, reorderItems, startShopping]);

  useEffect(() => {
    syncOperations(listId);
  }, [listId, syncOperations]);

  useAppState((state) => {
    if (state === "active") {
      syncOperations(listId);
    }
  });

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
