import { Operation } from '@core/models/operation.entity';

export type SetListModeOperation = Operation<{
  id: string;
  mode: 'edit' | 'play';
}>;
