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
      id: "list-" + Date.now(),
      name,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    set(
      produce((s: GroceryListStore) => {
        s.lists[list.id] = list;
      }),
    );

    await storageService.persistList(list);

    return list;
  },

  updateList: async (id: string, updatedFields: Partial<GroceryList>) => {
    set(
      produce((s: GroceryListStore) => {
        if (s.lists[id]) {
          s.lists[id] = { ...s.lists[id], ...updatedFields };
        }
      }),
    );

    await storageService.persistList(get().lists[id]);
  },

  deleteList: async (id: string) => {
    set(
      produce((s: GroceryListStore) => {
        delete s.lists[id];
      }),
    );

    await storageService.deleteList(id);
  },

  addItem: async (listId: string, name: string) => {
    const newItem: GroceryItem = {
      id: "item-" + Date.now(),
      name,
      quantity: 1,
      checked: false,
      updatedAt: new Date(),
      deletedAt: null,
    };

    set(
      produce((s: GroceryListStore) => {
        s.lists[listId].items.push(newItem);
      }),
    );

    await storageService.persistList(get().lists[listId]);
  },

  updateItem: async (
    listId: string,
    itemId: string,
    updatedItem: Partial<GroceryItem>,
  ) => {
    set(
      produce((s: GroceryListStore) => {
        const items = s.lists[listId].items;
        const index = items.findIndex((item) => item.id === itemId);
        if (index !== -1) {
          items[index] = { ...items[index], ...updatedItem };
        }
      }),
    );

    await storageService.persistList(get().lists[listId]);
  },

  deleteItem: async (listId: string, itemId: string) => {
    set(
      produce((s: GroceryListStore) => {
        s.lists[listId].items = s.lists[listId].items.filter(
          (item) => item.id !== itemId,
        );
      }),
    );

    await storageService.persistList(get().lists[listId]);
  },

  reorderItems: async (listId: string, newItems: GroceryItem[]) => {
    set(
      produce((state) => {
        state.lists[listId].items = newItems;
      }),
    );

    await storageService.persistList(get().lists[listId]);
  },
}));
