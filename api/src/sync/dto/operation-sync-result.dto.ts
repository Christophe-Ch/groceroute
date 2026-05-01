export type OperationSyncStatus = 'applied' | 'skipped' | 'failed';

export class OperationSyncResultDto {
  id: string;
  status: OperationSyncStatus;
  error?: string;
}
