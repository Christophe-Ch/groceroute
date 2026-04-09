import EditList from "@/components/list/edit-list";
import PlayList from "@/components/list/play-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useGroceryListStore } from "@/store/grocery-list.store";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

type ListScreenParams = {
  listId: string;
};

const ListScreen = () => {
  const { listId } = useLocalSearchParams<ListScreenParams>();
  const { lists } = useGroceryListStore();
  const [mode, setMode] = useState<"edit" | "play">("edit");

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
      {mode === "edit" ? (
        <EditList list={list} onModeChange={() => setMode("play")} />
      ) : (
        <PlayList list={list} onModeChange={() => setMode("edit")} />
      )}
    </ThemedView>
  );
};

export default ListScreen;
