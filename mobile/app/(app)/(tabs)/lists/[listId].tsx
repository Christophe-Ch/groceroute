import EditList from "@/components/list/edit-list";
import PlayList from "@/components/list/play-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { orderItems } from "@/domain/grocery/distance";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";

type ListScreenParams = {
  listId: string;
};

const ListScreen = () => {
  const { listId } = useLocalSearchParams<ListScreenParams>();
  const list = useGroceryListStore((s) => s.lists[listId]);
  const updateList = useGroceryListStore((s) => s.updateList);
  const [mode, setMode] = useState<"edit" | "play">("edit");

  const onModeChange = useCallback(async (next: "edit" | "play") => {
    if (next === "play" && list) {
      const orderedItems = orderItems(list.items, list.distances);
      await updateList(list.id, { items: orderedItems });
    }
    setMode(next);
  }, [list, updateList]);

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
      {mode === "edit" ? (
        <EditList list={list} onModeChange={onStartPlay} />
      ) : (
        <PlayList list={list} onModeChange={onStopPlay} />
      )}
    </ThemedView>
  );
};

export default ListScreen;
