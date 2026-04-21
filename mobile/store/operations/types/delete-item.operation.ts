import { Operation } from "./operation";

export type DeleteItemOperation = Operation<{
  listId: string;
  itemId: string;
}>;
