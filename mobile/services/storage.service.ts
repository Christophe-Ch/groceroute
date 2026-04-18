import { GroceryList } from "@/models/grocery";
import { Operation } from "@/store/operations/types/operation";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  index: "lists:index",
  list: (id: string) => `lists:${id}`,
  operations: "operations",
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

  /** Register a new list ID in the index. Call once at list creation. */
  async registerList(id: string): Promise<void> {
    const rawIndex = await AsyncStorage.getItem(KEYS.index);
    const index = rawIndex ? JSON.parse(rawIndex) : [];
    if (!index.includes(id)) {
      await AsyncStorage.setItem(KEYS.index, JSON.stringify([...index, id]));
    }
  },

  /** Persist list data only — does not touch the index. */
  async saveList(list: GroceryList): Promise<void> {
    await AsyncStorage.setItem(KEYS.list(list.id), JSON.stringify(list));
  },

  async deleteList(id: string): Promise<void> {
    const rawIndex = await AsyncStorage.getItem(KEYS.index);
    const index = rawIndex ? JSON.parse(rawIndex) : [];
    const newIndex = index.filter((storedId: string) => storedId !== id);
    await AsyncStorage.setItem(KEYS.index, JSON.stringify(newIndex));
    await AsyncStorage.removeItem(KEYS.list(id));
  },

  async storeOperation(operation: Operation): Promise<void> {
    const rawOperations = await AsyncStorage.getItem(KEYS.operations);
    const operations = rawOperations ? JSON.parse(rawOperations) : [];
    await AsyncStorage.setItem(KEYS.operations, JSON.stringify([...operations, operation]));
  },
};
