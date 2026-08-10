import { GroceryList } from "@/models/grocery";
import { AbandonShoppingOperation } from "../types/abandon-shopping.operation";
import { OperationHandler } from "./operation-handler";

export const abandonShoppingHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  AbandonShoppingOperation
> = (state, operation) => {
  const list = state.lists[operation.payload.listId];
  if (!list) return;
  list.mode = "edit";
  list.items = list.items.map((item) => ({ ...item, checked: false }));
  list.sessionCheckOrder = null;
};
