import { Operation } from '@core/models/operation.entity';
import { Participant } from '@lists/models/participant';

export type AddParticipantOperation = Operation<{
  participant: Participant;
}>;
