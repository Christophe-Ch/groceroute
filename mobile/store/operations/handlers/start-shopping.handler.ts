import { GroceryList } from "@/models/grocery";
import { StartShoppingOperation } from "../types/start-shopping.operation";
import { OperationHandler } from "./operation-handler";

export const startShoppingHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  StartShoppingOperation
> = (state, operation) => {
  const list = state.lists[operation.payload.listId];
  if (list) {
    list.mode = "play";
  }
};
