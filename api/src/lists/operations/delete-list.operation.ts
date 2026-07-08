import { Operation } from '@core/models/operation.entity';

export type DeleteListOperation = Operation<{
  listId: string;
}>;
