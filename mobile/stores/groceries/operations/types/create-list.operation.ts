import { Participant } from "@/models/grocery";
import { Operation } from "./operation";

export type CreateListOperation = Operation<{
  name: string;
  owner: Participant | null;
}>;
