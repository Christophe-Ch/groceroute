import { GroceryList } from "@/models/grocery";
import { ReorderItemsOperation } from "../types/reorder-items.operation";
import { OperationHandler } from "./operation-handler";

export const reorderItemsHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  ReorderItemsOperation
> = (state, operation) => {
  const { listId, newItems } = operation.payload;
  const list = state.lists[listId];
  if (!list) return;

  list.items = newItems;
};
