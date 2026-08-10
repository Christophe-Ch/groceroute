import { Operation } from "./operation";

export type DeleteItemOperation = Operation<{
  itemId: string;
}>;
