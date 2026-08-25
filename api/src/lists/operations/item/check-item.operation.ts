import { Operation } from '@core/models/operation.entity';

export type CheckItemOperation = Operation<{
  itemId: string;
}>;
