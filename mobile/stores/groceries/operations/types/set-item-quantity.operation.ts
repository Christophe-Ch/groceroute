import { Operation } from "./operation";

export type SetItemQuantityOperation = Operation<{
  listId: string;
  itemId: string;
  quantity: string;
}>;
