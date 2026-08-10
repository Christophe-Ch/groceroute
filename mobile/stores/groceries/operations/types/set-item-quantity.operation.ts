import { Operation } from "./operation";

export type SetItemQuantityOperation = Operation<{
  itemId: string;
  quantity: string;
}>;
