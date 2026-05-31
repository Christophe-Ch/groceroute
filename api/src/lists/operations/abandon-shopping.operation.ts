import { Operation } from 'src/core/models/operation.entity';

export type AbandonShoppingOperation = Operation<{
  listId: string;
}>;
