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
  const setListMode = useGroceryListStore((s) => s.setListMode);
  const updateList = useGroceryListStore((s) => s.updateList);

  const onModeChange = useCallback(
    async (next: "edit" | "play") => {
      if (next === "play" && list) {
        const orderedItems = orderItems(list.items, list.distances);
        await updateList(list.id, { items: orderedItems });
      }
      setListMode(list.id, next);
    },
    [list, updateList, setListMode],
  );

  const onStartPlay = useCallback(() => onModeChange("play"), [onModeChange]);
  const onStopPlay = useCallback(() => onModeChange("edit"), [onModeChange]);

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
        <EditList list={list} onModeChange={onStartPlay} />
      ) : (
        <PlayList list={list} onModeChange={onStopPlay} />
      )}
    </ThemedView>
  );
};

export default ListScreen;
