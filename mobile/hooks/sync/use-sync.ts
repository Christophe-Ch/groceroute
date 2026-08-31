import { useEffect } from "react";
import Constants from "expo-constants";
import EventSource from "react-native-sse";
import { useGroceryListStore } from "@/stores/groceries/grocery-list.store";

export const useSync = (userToken: string | null) => {
  const syncOperations = useGroceryListStore((s) => s.syncOperations);
  const syncAllLists = useGroceryListStore((s) => s.syncAllLists);

  useEffect(() => {
    if (!userToken) return;

    const baseUrl = Constants.expoConfig?.extra?.API_BASE_URL;

    const eventSource = new EventSource(`${baseUrl}/sync/stream`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        Accept: "text/event-stream",
      },
    });

    eventSource.addEventListener("open", () => {
      syncAllLists();
    });

    eventSource.addEventListener("message", (event) => {
      if (event.data) {
        try {
          const { listId } = JSON.parse(event.data);
          syncOperations(listId);
        } catch (e) {
          console.error("Error when parsing event", e);
        }
      }
    });

    return () => {
      eventSource.removeAllEventListeners();
      eventSource.close();
    };
  }, [syncAllLists, syncOperations, userToken]);
};
