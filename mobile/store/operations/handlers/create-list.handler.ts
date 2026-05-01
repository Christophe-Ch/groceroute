import { GroceryList } from "@/models/grocery";
import { CreateListOperation } from "../types/create-list.operation";
import { OperationHandler } from "./operation-handler";

export const createListHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  CreateListOperation
> = (state, operation) => {
  const newList: GroceryList = {
    id: operation.payload.id,
    name: operation.payload.name,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    pastItems: [],
    distances: [],
    mode: "edit",
  };

  state.lists[newList.id] = newList;
};
