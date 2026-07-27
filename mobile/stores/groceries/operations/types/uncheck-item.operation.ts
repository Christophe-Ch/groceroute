import { Operation } from "./operation";

export type UncheckItemOperation = Operation<{
  listId: string;
  itemId: string;
}>;
