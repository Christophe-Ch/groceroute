import { OperationsHandler } from './operations.handler';
import { OperationProjector } from '../projectors/operation-projector';
import { Operation } from '../models/operation.entity';
import { EntityManager } from 'typeorm';
import { OperationType } from '../models/operation-type.enum';

describe('OperationsHandler', () => {
  let handler: OperationsHandler;

  beforeEach(() => {
    handler = new OperationsHandler();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return provider', () => {
    const projector = {} as OperationProjector;

    handler['handlers'].set(OperationType.CREATE_LIST, projector);

    expect(handler.for(OperationType.CREATE_LIST)).toEqual(projector);
  });

  it('should return undefined provider', () => {
    expect(handler.for(OperationType.CREATE_LIST)).toBeUndefined();
  });

  it('should register provider for each operation type', () => {
    new (class extends OperationProjector {
      constructor(handler: OperationsHandler) {
        super([OperationType.CREATE_LIST, OperationType.DELETE_LIST], handler);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handle(op: Operation, manager: EntityManager): Promise<void> {
        return Promise.resolve();
      }
    })(handler);

    expect(Array.from(handler['handlers'].keys())).toEqual([
      OperationType.CREATE_LIST,
      OperationType.DELETE_LIST,
    ]);
  });
});
