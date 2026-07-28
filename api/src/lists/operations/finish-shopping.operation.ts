import { Operation } from '@core/models/operation.entity';

export type FinishShoppingOperation = Operation<{
  checkOrder: string[];
}>;
