import { Operation } from '@core/models/operation.entity';

export type DeleteItemOperation = Operation<{
  itemId: string;
}>;
