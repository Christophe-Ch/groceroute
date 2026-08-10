import { Operation } from '@core/models/operation.entity';

export type AddItemOperation = Operation<{
  name: string;
  id: string;
}>;
