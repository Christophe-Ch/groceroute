import { GroceryList } from "@/models/grocery";
import { RenameListOperation } from "../types/rename-list.operation";
import { OperationHandler } from "./operation-handler";

export const renameListHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  RenameListOperation
> = (state, operation) => {
  const { listId, name } = operation.payload;
  const list = state.lists[listId];
  if (list) {
    list.name = name;
  }
};
