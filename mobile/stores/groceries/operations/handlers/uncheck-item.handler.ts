import { GroceryList } from "@/models/grocery";
import { UncheckItemOperation } from "../types/uncheck-item.operation";
import { OperationHandler } from "./operation-handler";
import { SessionCheckOrder } from "@/models/grocery/grocery-list";

export const uncheckItemHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  UncheckItemOperation
> = (state, operation) => {
  const { listId, itemId } = operation.payload;
  const list = state.lists[listId];
  if (!list) return;

  const item = list.items.find((i) => i.id === itemId);
  if (item) {
    item.checked = false;
    removeItemToCheckOrder(item.id, list.sessionCheckOrder!);
  }
};

function removeItemToCheckOrder(
  itemId: string,
  sessionCheckOrder: SessionCheckOrder,
) {
  sessionCheckOrder.forEach((participantCheckOrder) => {
    if (participantCheckOrder.has(itemId)) {
      participantCheckOrder.delete(itemId);
      return;
    }
  });
}
