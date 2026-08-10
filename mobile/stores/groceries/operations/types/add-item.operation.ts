import { Operation } from "./operation";

export type AddItemOperation = Operation<{
  name: string;
  id: string;
}>;
