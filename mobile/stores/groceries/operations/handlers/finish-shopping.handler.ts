import { computeDistances } from "@/domain/grocery/distance";
import { GroceryList } from "@/models/grocery";
import { FinishShoppingOperation } from "../types/finish-shopping.operation";
import { OperationHandler } from "./operation-handler";

export const finishShoppingHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  FinishShoppingOperation
> = (state, operation) => {
  const { listId } = operation.payload;
  const list = state.lists[listId];
  if (!list) return;

  updateListPastItems(list);
  updateListDistances(list);
  resetListState(list);
};

function updateListPastItems(list: GroceryList) {
  list.items.forEach((item) => {
    if (list.pastItems.some((pastItem) => pastItem.name === item.name)) return;

    list.pastItems.push({ ...item, quantity: "" });
  });
}

function updateListDistances(list: GroceryList) {
  list.distances = Array.from(list.sessionCheckOrder!.values()).flatMap(
    (checkOrder) => computeDistances(Array.from(checkOrder), list.distances),
  );
}

function resetListState(list: GroceryList) {
  list.items = [];
  list.mode = "edit";
  list.sessionCheckOrder = null;
}
