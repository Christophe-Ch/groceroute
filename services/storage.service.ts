import { GroceryList } from "@/models/grocery";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  index: "lists:index",
  list: (id: string) => `lists:${id}`,
};

export const storageService = {
  async hydrate(): Promise<GroceryList[]> {
    const raw = await AsyncStorage.getItem(KEYS.index);
    const ids = raw ? JSON.parse(raw) : [];
    if (ids.length === 0) return [];

    const pairs = await AsyncStorage.multiGet(ids.map(KEYS.list));

    return pairs
      .map(([_, value]) => (value ? JSON.parse(value) : null))
      .filter(Boolean);
  },

  async persistList(list: GroceryList): Promise<void> {
    const rawIndex = await AsyncStorage.getItem(KEYS.index);
    const index = rawIndex ? JSON.parse(rawIndex) : [];
    if (!index.includes(list.id)) {
      await AsyncStorage.setItem(
        KEYS.index,
        JSON.stringify([...index, list.id]),
      );
    }

    await AsyncStorage.setItem(KEYS.list(list.id), JSON.stringify(list));
  },

  async deleteList(id: string): Promise<void> {
    const rawIndex = await AsyncStorage.getItem(KEYS.index);
    const index = rawIndex ? JSON.parse(rawIndex) : [];
    const newIndex = index.filter((storedId: string) => storedId !== id);
    await AsyncStorage.setItem(KEYS.index, JSON.stringify(newIndex));
    await AsyncStorage.removeItem(KEYS.list(id));
  },
};
