import { GroceryList } from "@/models/grocery";
import { AddItemOperation } from "../types/add-item.operation";
import { OperationHandler } from "./operation-handler";

export const addItemHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  AddItemOperation
> = (state, operation) => {
  const { listId, name, id } = operation.payload;
  const list = state.lists[listId];
  if (!list || list.items.some((i) => i.id === id)) return;

  list.items.push({
    id,
    name,
    quantity: "",
    checked: false,
    updatedAt: new Date(),
    deletedAt: null,
  });
};
