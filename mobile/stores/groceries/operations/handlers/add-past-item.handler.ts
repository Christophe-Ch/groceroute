import { GroceryList } from "@/models/grocery";
import { AddPastItemOperation } from "../types/add-past-item.operation";
import { OperationHandler } from "./operation-handler";

export const addPastItemHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  AddPastItemOperation
> = (state, operation) => {
  const { listId, item } = operation.payload;
  const list = state.lists[listId];
  if (!list || list.items.some((i) => i.id === item.id)) return;

  list.items.push({ ...item, checked: false });
};
