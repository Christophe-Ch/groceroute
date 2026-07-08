import { Operation } from '@core/models/operation.entity';

export type CreateListOperation = Operation<{
  listId: string;
  name: string;
}>;
