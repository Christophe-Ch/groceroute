import { GroceryList } from "@/models/grocery";
import { RenameItemOperation } from "../types/rename-item.operation";
import { OperationHandler } from "./operation-handler";

export const renameItemHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  RenameItemOperation
> = (state, operation) => {
  const { listId, itemId, name } = operation.payload;
  const list = state.lists[listId];
  if (!list) return;

  const item = list.items.find((i) => i.id === itemId);
  if (item) {
    item.name = name;
  }
};
