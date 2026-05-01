import { Operation } from "./operation";

export type RenameListOperation = Operation<{
  listId: string;
  name: string;
}>;
