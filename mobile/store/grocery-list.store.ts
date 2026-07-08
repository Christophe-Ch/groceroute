import { sync } from "@/api/sync";
import { GroceryItem, GroceryList } from "@/models/grocery";
import { storageService } from "@/services/storage.service";
import { debounce } from "@/utils/debounce";
import { generateId } from "@/utils/generate-id";
import { produce } from "immer";
import { toast } from "sonner-native";
import { create } from "zustand";
import { operationHandlers } from "./operations/handlers/registry";
import {
  Operation,
  OperationInput,
  OperationType,
} from "./operations/types/operation";

type GroceryListStore = {
  lists: Record<string, GroceryList>;
  hydrated: boolean;
  isSyncing: boolean;

  hydrate: () => Promise<void>;
  createList: (name: string) => Promise<void>;
  startShopping: (listId: string) => Promise<void>;
  abandonShopping: (listId: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  addItem: (listId: string, name: string) => Promise<void>;
  renameItem: (listId: string, itemId: string, name: string) => Promise<void>;
  setItemQuantity: (
    listId: string,
    itemId: string,
    quantity: string,
  ) => Promise<void>;
  checkItem: (listId: string, itemId: string) => Promise<void>;
  uncheckItem: (listId: string, itemId: string) => Promise<void>;
  deleteItem: (listId: string, itemId: string) => Promise<void>;
  addPastItem: (listId: string, item: GroceryItem) => Promise<void>;
  reorderItems: (listId: string, newItems: GroceryItem[]) => Promise<void>;
  renameList: (listId: string, name: string) => Promise<void>;
  finishShopping: (listId: string, checkOrder: string[]) => Promise<void>;

  dispatchOperation: (input: OperationInput) => Promise<void>;
  applyOperation: (operation: Operation) => void;
  persistAfterOperation: (operation: Operation) => Promise<void>;
  queueOperation: (operation: Operation) => Promise<void>;
  syncOperations: () => Promise<void>;
};

export const useGroceryListStore = create<GroceryListStore>((set, get) => {
  const executeDebouncedSync = debounce(async () => {
    await get().syncOperations();
  }, 1000);

  return {
    lists: {},
    hydrated: false,
    isSyncing: false,

    hydrate: async () => {
      const lists = await storageService.hydrate();
      set({
        lists: Object.fromEntries(lists.map((list) => [list.id, list])),
        hydrated: true,
      });
    },

    createList: async (name: string) => {
      get().dispatchOperation({
        type: OperationType.CREATE_LIST,
        payload: { listId: generateId(), name },
      });
    },

    startShopping: async (listId: string) => {
      get().dispatchOperation({
        type: OperationType.START_SHOPPING,
        payload: { listId },
      });
    },

    abandonShopping: async (listId: string) => {
      get().dispatchOperation({
        type: OperationType.ABANDON_SHOPPING,
        payload: { listId },
      });
    },

    deleteList: async (listId: string) => {
      get().dispatchOperation({
        type: OperationType.DELETE_LIST,
        payload: { listId },
      });
    },

    addItem: async (listId: string, name: string) => {
      if (!get().lists[listId]) return;
      get().dispatchOperation({
        type: OperationType.ADD_ITEM,
        payload: { listId, name },
      });
    },

    addPastItem: async (listId: string, item: GroceryItem) => {
      if (!get().lists[listId]) return;
      get().dispatchOperation({
        type: OperationType.ADD_PAST_ITEM,
        payload: { listId, item },
      });
    },

    renameItem: async (listId: string, itemId: string, name: string) => {
      if (!get().lists[listId]) return;
      get().dispatchOperation({
        type: OperationType.RENAME_ITEM,
        payload: { listId, itemId, name },
      });
    },

    setItemQuantity: async (
      listId: string,
      itemId: string,
      quantity: string,
    ) => {
      if (!get().lists[listId]) return;
      get().dispatchOperation({
        type: OperationType.SET_ITEM_QUANTITY,
        payload: { listId, itemId, quantity },
      });
    },

    checkItem: async (listId: string, itemId: string) => {
      if (!get().lists[listId]) return;
      get().dispatchOperation({
        type: OperationType.CHECK_ITEM,
        payload: { listId, itemId },
      });
    },

    uncheckItem: async (listId: string, itemId: string) => {
      if (!get().lists[listId]) return;
      get().dispatchOperation({
        type: OperationType.UNCHECK_ITEM,
        payload: { listId, itemId },
      });
    },

    deleteItem: async (listId: string, itemId: string) => {
      if (!get().lists[listId]) return;
      get().dispatchOperation({
        type: OperationType.DELETE_ITEM,
        payload: { listId, itemId },
      });
    },

    reorderItems: async (listId: string, newItems: GroceryItem[]) => {
      if (!get().lists[listId]) return;
      get().dispatchOperation({
        type: OperationType.REORDER_ITEMS,
        payload: { listId, newItems },
      });
    },

    renameList: async (listId: string, name: string) => {
      if (!get().lists[listId]) return;
      get().dispatchOperation({
        type: OperationType.RENAME_LIST,
        payload: { listId, name },
      });
    },

    finishShopping: async (listId: string, checkOrder: string[]) => {
      if (!get().lists[listId]) return;
      get().dispatchOperation({
        type: OperationType.FINISH_SHOPPING,
        payload: { listId, checkOrder },
      });
    },

    dispatchOperation: async (input: OperationInput) => {
      const operation: Operation = {
        id: generateId(),
        actorId: "local",
        createdAt: new Date(),
        ...input,
      };
      get().applyOperation(operation);

      Promise.all([
        await get().persistAfterOperation(operation),
        await get().queueOperation(operation),
      ]).catch((err) => console.error("Background persistence failed", err));
    },

    applyOperation: (operation: Operation) => {
      set(
        produce((draft: GroceryListStore) => {
          const handler = operationHandlers[operation.type];
          if (handler) {
            handler(draft, operation);
          } else {
            console.warn(`No handler for operation type: ${operation.type}`);
          }
        }),
      );
    },

    persistAfterOperation: async (operation: Operation) => {
      try {
        const listId = operation.payload.listId;

        if (operation.type === OperationType.DELETE_LIST) {
          await storageService.deleteList(listId);
          return;
        }

        if (operation.type === OperationType.CREATE_LIST) {
          await storageService.registerList(listId);
        }

        await storageService.saveList(get().lists[listId]);
      } catch {
        toast.error("Something went wrong while saving your changes");
      }
    },

    queueOperation: async (operation: Operation) => {
      try {
        await storageService.storeOperation(operation);
        executeDebouncedSync();
      } catch {
        toast.error("Something went wrong while processing operation");
      }
    },

    syncOperations: async () => {
      if (get().isSyncing) return;

      set({ isSyncing: true });

      try {
        const pendingOps = await storageService.getQueuedOperations();
        if (pendingOps.length === 0) return;

        const batchIds = pendingOps.map((op) => op.id);
        await sync(pendingOps);

        await storageService.clearQueuedOperations(batchIds);
      } catch (err) {
        console.error("Sync failed", err);
      } finally {
        set({ isSyncing: false });
      }
    },
  };
});
