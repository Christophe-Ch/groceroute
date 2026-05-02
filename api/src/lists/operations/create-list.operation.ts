import { Operation } from '@core/models/operation.entity';

export type CreateListOperation = Operation<{
  id: string;
  name: string;
}>;
