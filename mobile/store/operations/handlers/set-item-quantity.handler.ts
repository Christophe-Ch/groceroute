import { GroceryList } from "@/models/grocery";
import { SetItemQuantityOperation } from "../types/set-item-quantity.operation";
import { OperationHandler } from "./operation-handler";

export const setItemQuantityHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  SetItemQuantityOperation
> = (state, operation) => {
  const { listId, itemId, quantity } = operation.payload;
  const list = state.lists[listId];
  if (!list) return;

  const item = list.items.find((i) => i.id === itemId);
  if (item) {
    item.quantity = quantity;
  }
};
