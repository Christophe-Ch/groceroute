import { Participant } from "@/models/grocery/participant";
import { Operation } from "./operation";

export type AddParticipantOperation = Operation<{
  listId: string;
  participant: Participant;
}>;
