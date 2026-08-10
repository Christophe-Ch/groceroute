import { Participant } from "@/models/grocery/participant";
import { Operation } from "./operation";

export type AddParticipantOperation = Operation<{
  participant: Participant;
}>;
