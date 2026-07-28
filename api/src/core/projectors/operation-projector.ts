import { OperationType } from '@core/models/operation-type.enum';
import { Operation } from '@core/models/operation.entity';
import { OperationsHandler } from '@core/services/operations.handler';
import { EntityManager } from 'typeorm';

export abstract class OperationProjector {
  constructor(
    readonly handles: OperationType[],
    operationsHandler: OperationsHandler,
  ) {
    operationsHandler.register(this);
  }

  abstract handle(op: Operation, manager: EntityManager): Promise<void>;
}
