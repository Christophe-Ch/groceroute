import { GroceryList } from "@/models/grocery";
import { DeleteListOperation } from "../types/delete-list.operation";
import { OperationHandler } from "./operation-handler";

export const deleteListHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  DeleteListOperation
> = (state, operation) => {
  delete state.lists[operation.payload.id];
};
