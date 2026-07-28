import { Operation } from '@core/models/operation.entity';

export type CreateListOperation = Operation<{
  name: string;
}>;
