import { GroceryList } from "@/models/grocery";
import { CheckItemOperation } from "../types/check-item.operation";
import { OperationHandler } from "./operation-handler";
import { SessionCheckOrder } from "@/models/grocery/grocery-list";

export const checkItemHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  CheckItemOperation
> = (state, operation) => {
  const {
    actorId,
    payload: { listId, itemId },
  } = operation;
  const list = state.lists[listId];
  if (!list) return;

  const item = list.items.find((i) => i.id === itemId);
  if (item) {
    item.checked = true;
    addItemToCheckOrderForActor(item.id, list.sessionCheckOrder!, actorId);
  }
};

const addItemToCheckOrderForActor = (
  itemId: string,
  sessionCheckOrder: SessionCheckOrder,
  actorId: string,
) => {
  const order = sessionCheckOrder.get(actorId) ?? new Set();
  order.add(itemId);
  sessionCheckOrder.set(actorId, order);
};
