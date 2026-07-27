import { GroceryList } from "@/models/grocery";
import { CreateListOperation } from "../types/create-list.operation";
import { OperationHandler } from "./operation-handler";

export const createListHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  CreateListOperation
> = (state, operation) => {
  if (Object.hasOwn(state.lists, operation.payload.listId)) return;

  const newList: GroceryList = {
    id: operation.payload.listId,
    name: operation.payload.name,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    pastItems: [],
    distances: [],
    mode: "edit",
    currentSequence: 0,
  };

  state.lists[newList.id] = newList;
};
