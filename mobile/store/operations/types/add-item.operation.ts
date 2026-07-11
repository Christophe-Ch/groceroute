import { Operation } from "./operation";

export type AddItemOperation = Operation<{
  listId: string;
  name: string;
  id: string;
}>;
