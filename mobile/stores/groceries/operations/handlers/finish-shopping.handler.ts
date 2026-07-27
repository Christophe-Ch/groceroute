import { computeDistances } from "@/domain/grocery/distance";
import { GroceryList } from "@/models/grocery";
import { FinishShoppingOperation } from "../types/finish-shopping.operation";
import { OperationHandler } from "./operation-handler";

export const finishShoppingHandler: OperationHandler<
  { lists: Record<string, GroceryList> },
  FinishShoppingOperation
> = (state, operation) => {
  const { listId, checkOrder } = operation.payload;
  const list = state.lists[listId];
  if (!list) return;

  const newPastItems = list.items
    .filter((item) => !list.pastItems.some((past) => past.name === item.name))
    .map((item) => ({ ...item, quantity: "" }));

  list.distances = computeDistances(checkOrder, list.distances);
  list.pastItems = [...list.pastItems, ...newPastItems];
  list.items = [];
  list.mode = "edit";
};
