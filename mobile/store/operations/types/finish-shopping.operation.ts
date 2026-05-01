import { Operation } from "./operation";

export type FinishShoppingOperation = Operation<{
  listId: string;
  checkOrder: string[];
}>;
