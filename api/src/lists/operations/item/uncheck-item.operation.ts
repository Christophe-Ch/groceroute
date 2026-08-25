import { Operation } from '@core/models/operation.entity';

export type UncheckItemOperation = Operation<{
  itemId: string;
}>;
