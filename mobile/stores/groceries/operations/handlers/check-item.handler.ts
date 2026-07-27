import { GroceryList } from "@/models/grocery";
import { CheckItemOperation } from "../types/check-item.operation";
import { OperationHandler } from "./operation-handler";

export const checkItemHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  CheckItemOperation
> = (state, operation) => {
  const { listId, itemId } = operation.payload;
  const list = state.lists[listId];
  if (!list) return;

  const item = list.items.find((i) => i.id === itemId);
  if (item) {
    item.checked = true;
  }
};
