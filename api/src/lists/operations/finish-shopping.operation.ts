import { Operation } from 'src/core/models/operation.entity';

export type FinishShoppingOperation = Operation<{
  listId: string;
  checkOrder: string[];
}>;
