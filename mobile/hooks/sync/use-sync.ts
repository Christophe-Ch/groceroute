import { useEffect } from "react";
import Constants from "expo-constants";
import EventSource from "react-native-sse";
import { useGroceryListStore } from "@/store/grocery-list.store";

export const useSync = (userToken: string | null) => {
  const { syncOperations } = useGroceryListStore();

  useEffect(() => {
    if (!userToken) return;

    const baseUrl = Constants.expoConfig?.extra?.API_BASE_URL;

    const eventSource = new EventSource(`${baseUrl}/sync/stream`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        Accept: "text/event-stream",
      },
    });

    eventSource.addEventListener("message", (event) => {
      if (event.data) {
        try {
          const { listId } = JSON.parse(event.data);
          syncOperations(listId);
        } catch (e) {
          console.log("Error when parsing event", e);
        }
      }
    });
    eventSource.addEventListener("error", (event) => {
      if (event.type === "error") {
        console.error("Network connection dropped/timed out:", event.message);
      } else if (event.type === "exception") {
        console.error(
          "Internal polyfill execution crash:",
          event.message,
          event.error,
        );
      }
    });

    return () => {
      eventSource.removeAllEventListeners();
      eventSource.close();
    };
  }, [userToken]);
};
