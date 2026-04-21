import { GroceryItem, GroceryList } from "@/models/grocery";
import { storageService } from "@/services/storage.service";
import { generateId } from "@/utils/generate-id";
import { produce } from "immer";
import { toast } from "sonner-native";
import { create } from "zustand";
import { addItemHandler } from "./operations/handlers/add-item.handler";
import { addPastItemHandler } from "./operations/handlers/add-past-item.handler";
import { createListHandler } from "./operations/handlers/create-list.handler";
import { deleteItemHandler } from "./operations/handlers/delete-item.handler";
import { deleteListHandler } from "./operations/handlers/delete-list.handler";
import { finishShoppingHandler } from "./operations/handlers/finish-shopping.handler";
import { renameListHandler } from "./operations/handlers/rename-list.handler";
import { reorderItemsHandler } from "./operations/handlers/reorder-items.handler";
import { setListModeHandler } from "./operations/handlers/set-list-mode.handler";
import { updateItemHandler } from "./operations/handlers/update-item.handler";
import { AddItemOperation } from "./operations/types/add-item.operation";
import { AddPastItemOperation } from "./operations/types/add-past-item.operation";
import { CreateListOperation } from "./operations/types/create-list.operation";
import { DeleteItemOperation } from "./operations/types/delete-item.operation";
import { DeleteListOperation } from "./operations/types/delete-list.operation";
import { FinishShoppingOperation } from "./operations/types/finish-shopping.operation";
import { Operation, OperationType } from "./operations/types/operation";
import { RenameListOperation } from "./operations/types/rename-list.operation";
import { ReorderItemsOperation } from "./operations/types/reorder-items.operation";
import { SetListModeOperation } from "./operations/types/set-list-mode.operation";
import { UpdateItemOperation } from "./operations/types/update-item.operation";

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
  renameList: (listId: string, name: string) => Promise<void>;
  finishShopping: (listId: string, checkOrder: string[]) => Promise<void>;

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

    const op: AddPastItemOperation = {
      id: generateId(),
      type: OperationType.ADD_PAST_ITEM,
      actorId: "local",
      payload: { listId, item },
      sequence: Date.now(),
    };

    get().dispatchOperation(op);
  },

  updateItem: async (
    listId: string,
    itemId: string,
    updatedItem: Partial<GroceryItem>,
  ) => {
    if (!get().lists[listId]) return;

    const op: UpdateItemOperation = {
      id: generateId(),
      type: OperationType.UPDATE_ITEM,
      actorId: "local",
      payload: { listId, itemId, updatedItem },
      sequence: Date.now(),
    };

    get().dispatchOperation(op);
  },

  deleteItem: async (listId: string, itemId: string) => {
    if (!get().lists[listId]) return;

    const op: DeleteItemOperation = {
      id: generateId(),
      type: OperationType.DELETE_ITEM,
      actorId: "local",
      payload: { listId, itemId },
      sequence: Date.now(),
    };

    get().dispatchOperation(op);
  },

  reorderItems: async (listId: string, newItems: GroceryItem[]) => {
    if (!get().lists[listId]) return;

    const op: ReorderItemsOperation = {
      id: generateId(),
      type: OperationType.REORDER_ITEMS,
      actorId: "local",
      payload: { listId, newItems },
      sequence: Date.now(),
    };

    get().dispatchOperation(op);
  },

  renameList: async (listId: string, name: string) => {
    if (!get().lists[listId]) return;

    const op: RenameListOperation = {
      id: generateId(),
      type: OperationType.RENAME_LIST,
      actorId: "local",
      payload: { listId, name },
      sequence: Date.now(),
    };

    get().dispatchOperation(op);
  },

  finishShopping: async (listId: string, checkOrder: string[]) => {
    if (!get().lists[listId]) return;

    const op: FinishShoppingOperation = {
      id: generateId(),
      type: OperationType.FINISH_SHOPPING,
      actorId: "local",
      payload: { listId, checkOrder },
      sequence: Date.now(),
    };

    get().dispatchOperation(op);
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
          case OperationType.ADD_PAST_ITEM:
            addPastItemHandler(draft, operation as AddPastItemOperation);
            break;
          case OperationType.UPDATE_ITEM:
            updateItemHandler(draft, operation as UpdateItemOperation);
            break;
          case OperationType.DELETE_ITEM:
            deleteItemHandler(draft, operation as DeleteItemOperation);
            break;
          case OperationType.REORDER_ITEMS:
            reorderItemsHandler(draft, operation as ReorderItemsOperation);
            break;
          case OperationType.RENAME_LIST:
            renameListHandler(draft, operation as RenameListOperation);
            break;
          case OperationType.FINISH_SHOPPING:
            finishShoppingHandler(draft, operation as FinishShoppingOperation);
            break;
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
