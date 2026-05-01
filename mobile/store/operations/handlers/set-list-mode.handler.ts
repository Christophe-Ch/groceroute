import { GroceryList } from "@/models/grocery";
import { SetListModeOperation } from "../types/set-list-mode.operation";
import { OperationHandler } from "./operation-handler";

export const setListModeHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  SetListModeOperation
> = (state, operation) => {
  const { id, mode } = operation.payload;
  const list = state.lists[id];
  if (list) {
    list.mode = mode;
  }
};
