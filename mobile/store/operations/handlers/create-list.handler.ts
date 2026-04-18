import { GroceryList } from "@/models/grocery";
import { generateId } from "@/utils/generate-id";
import { CreateListOperation } from "../types/create-list.operation";
import { OperationHandler } from "./operation-handler";

export const createListHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  CreateListOperation
> = (state, operation) => {
  const newList: GroceryList = {
    id: generateId(),
    name: operation.payload.name,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    pastItems: [],
    distances: [],
  };

  state.lists[newList.id] = newList;
};
