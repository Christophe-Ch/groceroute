import { GroceryItem, GroceryList } from "@/models/grocery";
import { storageService } from "@/services/storage.service";
import { produce } from "immer";
import { create } from "zustand";

type GroceryListStore = {
  lists: Record<string, GroceryList>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  createList: (name: string) => Promise<GroceryList>;
  deleteList: (id: string) => Promise<void>;
  addItem: (listId: string, name: string) => Promise<void>;
  updateItem: (
    listId: string,
    itemId: string,
    updatedItem: Partial<GroceryItem>,
  ) => Promise<void>;
  deleteItem: (listId: string, itemId: string) => Promise<void>;
  addPastItem: (listId: string, item: GroceryItem) => Promise<void>;
  reorderItems: (listId: string, newItems: GroceryItem[]) => Promise<void>;
  updateList: (
    id: string,
    updatedFields: Partial<GroceryList>,
  ) => Promise<void>;
};

export const useGroceryListStore = create<GroceryListStore>((set, get) => ({
  lists: {},
  hydrated: false,

  hydrate: async () => {
    const lists = await storageService.hydrate();
    set({
      lists: Object.fromEntries(lists.map((list) => [list.id, list])),
      hydrated: true,
    });
  },

  createList: async (name: string) => {
    const list: GroceryList = {
      id: crypto.randomUUID(),
      name,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      pastItems: [],
      distances: [],
    };

    set(
      produce((draft: GroceryListStore) => {
        draft.lists[list.id] = list;
      }),
    );

    await storageService.persistList(list);

    return list;
  },

  updateList: async (id: string, updatedFields: Partial<GroceryList>) => {
    const existing = get().lists[id];
    if (!existing) return;

    const updated = { ...existing, ...updatedFields };
    set(
      produce((draft: GroceryListStore) => {
        draft.lists[id] = updated;
      }),
    );

    await storageService.persistList(updated);
  },

  deleteList: async (id: string) => {
    set(
      produce((draft: GroceryListStore) => {
        delete draft.lists[id];
      }),
    );

    await storageService.deleteList(id);
  },

  addItem: async (listId: string, name: string) => {
    if (!get().lists[listId]) return;

    const newItem: GroceryItem = {
      id: crypto.randomUUID(),
      name,
      quantity: "",
      checked: false,
      updatedAt: new Date(),
      deletedAt: null,
    };

    set(
      produce((draft: GroceryListStore) => {
        draft.lists[listId].items.push(newItem);
      }),
    );

    await storageService.persistList(get().lists[listId]);
  },

  addPastItem: async (listId: string, item: GroceryItem) => {
    if (!get().lists[listId]) return;

    set(
      produce((draft: GroceryListStore) => {
        draft.lists[listId].items.push({ ...item, checked: false });
      }),
    );

    await storageService.persistList(get().lists[listId]);
  },

  updateItem: async (
    listId: string,
    itemId: string,
    updatedItem: Partial<GroceryItem>,
  ) => {
    if (!get().lists[listId]) return;

    set(
      produce((draft: GroceryListStore) => {
        const items = draft.lists[listId].items;
        const index = items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          items[index] = { ...items[index], ...updatedItem };
        }
      }),
    );

    await storageService.persistList(get().lists[listId]);
  },

  deleteItem: async (listId: string, itemId: string) => {
    if (!get().lists[listId]) return;

    set(
      produce((draft: GroceryListStore) => {
        draft.lists[listId].items = draft.lists[listId].items.filter(
          (item) => item.id !== itemId,
        );
      }),
    );

    await storageService.persistList(get().lists[listId]);
  },

  reorderItems: async (listId: string, newItems: GroceryItem[]) => {
    if (!get().lists[listId]) return;

    set(
      produce((draft: GroceryListStore) => {
        draft.lists[listId].items = newItems;
      }),
    );

    await storageService.persistList(get().lists[listId]);
  },
}));
