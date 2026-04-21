import { GroceryItem, GroceryList } from "@/models/grocery";
import { storageService } from "@/services/storage.service";
import { generateId } from "@/utils/generate-id";
import { produce } from "immer";
import { toast } from "sonner-native";
import { create } from "zustand";
import { addItemHandler } from "./operations/handlers/add-item.handler";
import { createListHandler } from "./operations/handlers/create-list.handler";
import { deleteListHandler } from "./operations/handlers/delete-list.handler";
import { setListModeHandler } from "./operations/handlers/set-list-mode.handler";
import { AddItemOperation } from "./operations/types/add-item.operation";
import { CreateListOperation } from "./operations/types/create-list.operation";
import { DeleteListOperation } from "./operations/types/delete-list.operation";
import { Operation, OperationType } from "./operations/types/operation";
import { SetListModeOperation } from "./operations/types/set-list-mode.operation";

type GroceryListStore = {
  lists: Record<string, GroceryList>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  createList: (name: string) => Promise<void>;
  setListMode: (id: string, mode: "edit" | "play") => Promise<void>;
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

  dispatchOperation: (operation: Operation) => Promise<void>;
  applyOperation: (operation: Operation) => void;
  queueOperation: (operation: Operation) => Promise<void>;
};

export const useGroceryListStore = create<GroceryListStore>((set, get) => ({
  operations: [],
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
    const op: CreateListOperation = {
      id: generateId(),
      type: OperationType.CREATE_LIST,
      actorId: "local", // This should ideally be the user's ID
      payload: { name },
      sequence: Date.now(), // Using timestamp as a simple sequence generator
    };

    get().dispatchOperation(op);
  },

  setListMode: async (id: string, mode: "edit" | "play") => {
    const op: SetListModeOperation = {
      id: generateId(),
      type: OperationType.SET_LIST_MODE,
      actorId: "local",
      payload: { id, mode },
      sequence: Date.now(),
    };

    get().dispatchOperation(op);
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
    const op: DeleteListOperation = {
      id: generateId(),
      type: OperationType.DELETE_LIST,
      actorId: "local",
      payload: { id },
      sequence: Date.now(),
    };

    get().dispatchOperation(op);
  },

  addItem: async (listId: string, name: string) => {
    if (!get().lists[listId]) return;

    const op: AddItemOperation = {
      id: generateId(),
      type: OperationType.ADD_ITEM,
      actorId: "local",
      payload: { listId, name },
      sequence: Date.now(),
    };

    get().dispatchOperation(op);
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

  dispatchOperation: async (operation: Operation) => {
    get().applyOperation(operation);
    await get().queueOperation(operation);
  },

  applyOperation: (operation: Operation) => {
    set(
      produce((draft: GroceryListStore) => {
        switch (operation.type) {
          case OperationType.CREATE_LIST:
            createListHandler(draft, operation as CreateListOperation);
            break;
          case OperationType.SET_LIST_MODE:
            setListModeHandler(draft, operation as SetListModeOperation);
            break;
          case OperationType.DELETE_LIST:
            deleteListHandler(draft, operation as DeleteListOperation);
            break;
          case OperationType.ADD_ITEM:
            addItemHandler(draft, operation as AddItemOperation);
            break;
          // Future cases for other operation types will go here
          default:
            console.warn(`No handler for operation type: ${operation.type}`);
        }
      }),
    );
  },

  queueOperation: async (operation: Operation) => {
    try {
      await storageService.storeOperation(operation);
    } catch {
      toast.error("Something went wrong while processing operation");
    }
  },
}));
