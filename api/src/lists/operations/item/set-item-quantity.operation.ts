import { Operation } from '@core/models/operation.entity';

export type SetItemQuantityOperation = Operation<{
  itemId: string;
  quantity: string;
}>;
