import { Operation } from "./operation";

export type CheckItemOperation = Operation<{
  listId: string;
  itemId: string;
}>;
