import { GroceryList } from "@/models/grocery";
import { generateId } from "@/utils/generate-id";
import { AddItemOperation } from "../types/add-item.operation";
import { OperationHandler } from "./operation-handler";

export const addItemHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  AddItemOperation
> = (state, operation) => {
  const { listId, name } = operation.payload;
  const list = state.lists[listId];
  if (!list) return;

  list.items.push({
    id: generateId(),
    name,
    quantity: "",
    checked: false,
    updatedAt: new Date(),
    deletedAt: null,
  });
};
