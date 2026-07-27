import { GroceryList } from "@/models/grocery";
import { DeleteItemOperation } from "../types/delete-item.operation";
import { OperationHandler } from "./operation-handler";

export const deleteItemHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  DeleteItemOperation
> = (state, operation) => {
  const { listId, itemId } = operation.payload;
  const list = state.lists[listId];
  if (!list) return;

  list.items = list.items.filter((item) => item.id !== itemId);
};
