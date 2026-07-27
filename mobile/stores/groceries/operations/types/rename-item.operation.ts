import { Operation } from "./operation";

export type RenameItemOperation = Operation<{
  listId: string;
  itemId: string;
  name: string;
}>;
