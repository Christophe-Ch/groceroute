import { GroceryList } from "@/models/grocery";
import { CreateListOperation } from "../types/create-list.operation";
import { OperationHandler } from "./operation-handler";
import { useAuthStore } from "@/stores/auth/auth.store";

export const createListHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  CreateListOperation
> = (state, operation) => {
  if (Object.hasOwn(state.lists, operation.payload.listId)) return;

  const participants = [];

  if (operation.payload.owner) {
    participants.push(operation.payload.owner);
  } else {
    const currentUser = useAuthStore.getState().currentUser;
    if (currentUser) {
      participants.push(currentUser);
    }
  }

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
    participants,
  };

  state.lists[newList.id] = newList;
};
