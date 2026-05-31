import { Operation } from 'src/core/models/operation.entity';

export type StartShoppingOperation = Operation<{
  listId: string;
}>;
