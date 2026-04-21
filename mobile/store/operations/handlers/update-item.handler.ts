import { GroceryList } from "@/models/grocery";
import { UpdateItemOperation } from "../types/update-item.operation";
import { OperationHandler } from "./operation-handler";

export const updateItemHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  UpdateItemOperation
> = (state, operation) => {
  const { listId, itemId, updatedItem } = operation.payload;
  const list = state.lists[listId];
  if (!list) return;

  const index = list.items.findIndex((item) => item.id === itemId);
  if (index !== -1) {
    list.items[index] = { ...list.items[index], ...updatedItem };
  }
};
