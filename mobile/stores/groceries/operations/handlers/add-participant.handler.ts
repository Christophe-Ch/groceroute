import { GroceryList } from "@/models/grocery";
import { AddParticipantOperation } from "../types/add-participant.operation";
import { OperationHandler } from "./operation-handler";

export const addParticipantHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  AddParticipantOperation
> = (state, operation) => {
  const {
    listId,
    participant: { id, email },
  } = operation.payload;
  const list = state.lists[listId];
  if (!list || list.participants.some((p) => p.id === id)) return;

  list.participants.push({
    id,
    email,
  });
};
