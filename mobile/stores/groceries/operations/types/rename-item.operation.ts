import { Operation } from "./operation";

export type RenameItemOperation = Operation<{
  itemId: string;
  name: string;
}>;
