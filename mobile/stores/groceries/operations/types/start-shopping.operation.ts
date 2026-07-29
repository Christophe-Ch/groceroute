import { Participant } from "@/models/grocery";
import { Operation } from "./operation";

export type StartShoppingOperation = Operation<{
  listId: string;
  participants: Participant[]
}>;
