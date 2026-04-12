import { GroceryItem, GroceryList } from "@/models/grocery";
import { storageService } from "@/services/storage.service";
import { produce } from "immer";
import { toast } from "sonner-native";
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

    try {
      await storageService.registerList(list.id);
      await storageService.saveList(list);
    } catch {
      toast.error("Failed to save list");
    }

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

    try {
      await storageService.saveList(updated);
    } catch {
      toast.error("Failed to save changes");
    }
  },

  deleteList: async (id: string) => {
    set(
      produce((draft: GroceryListStore) => {
        delete draft.lists[id];
      }),
    );

    try {
      await storageService.deleteList(id);
    } catch {
      toast.error("Failed to delete list");
    }
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

    try {
      await storageService.saveList(get().lists[listId]);
    } catch {
      toast.error("Failed to save changes");
    }
  },

  addPastItem: async (listId: string, item: GroceryItem) => {
    if (!get().lists[listId]) return;

    set(
      produce((draft: GroceryListStore) => {
        draft.lists[listId].items.push({ ...item, checked: false });
      }),
    );

    try {
      await storageService.saveList(get().lists[listId]);
    } catch {
      toast.error("Failed to save changes");
    }
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

    try {
      await storageService.saveList(get().lists[listId]);
    } catch {
      toast.error("Failed to save changes");
    }
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

    try {
      await storageService.saveList(get().lists[listId]);
    } catch {
      toast.error("Failed to save changes");
    }
  },

  reorderItems: async (listId: string, newItems: GroceryItem[]) => {
    if (!get().lists[listId]) return;

    set(
      produce((draft: GroceryListStore) => {
        draft.lists[listId].items = newItems;
      }),
    );

    try {
      await storageService.saveList(get().lists[listId]);
    } catch {
      toast.error("Failed to save changes");
    }
  },
}));
