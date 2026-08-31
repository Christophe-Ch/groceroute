import { Test } from '@nestjs/testing';
import { OperationsService } from './operations.service';
import {
  DataSource,
  EntityManager,
  JsonContains,
  MoreThan,
  Not,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { Operation } from '@core/models/operation.entity';
import { OperationsHandler } from './operations.handler';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { OperationType } from '@core/models/operation-type.enum';
import { OperationProjector } from '@core/projectors/operation-projector';
import { List } from '@lists/models/list.entity';

describe('OperationsService', () => {
  let service: OperationsService;
  let operationsRepository: jest.Mocked<Repository<Operation>>;
  let dataSource: jest.Mocked<DataSource>;
  let operationsHandler: jest.Mocked<OperationsHandler>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  function buildMock<T>(keys: (keyof T)[]): jest.Mocked<T> {
    const mock: unknown = {};

    keys.forEach((key) => {
      mock[key] = jest.fn();
    });

    return mock as jest.Mocked<T>;
  }

  beforeEach(async () => {
    operationsRepository = buildMock<Repository<Operation>>([
      'find',
      'existsBy',
    ]);
    dataSource = buildMock<DataSource>(['transaction']);
    operationsHandler = buildMock<OperationsHandler>(['for']);
    eventEmitter = buildMock<EventEmitter2>(['emit']);

    const moduleRef = await Test.createTestingModule({
      providers: [
        OperationsService,
        {
          provide: getRepositoryToken(Operation),
          useValue: operationsRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: dataSource,
        },
        { provide: OperationsHandler, useValue: operationsHandler },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = moduleRef.get(OperationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findForList', () => {
    it('should query operations from other actors after the last sequence', async () => {
      operationsRepository.find.mockResolvedValue([]);

      await service.findForList('user-1', 'list-1', '42');

      expect(operationsRepository.find).toHaveBeenCalledWith({
        where: {
          actorId: Not('user-1'),
          payload: JsonContains({ listId: 'list-1' }),
          sequence: MoreThan('42'),
        },
      });
    });

    it('should return the operations found', async () => {
      const operations = [buildOperation()];
      operationsRepository.find.mockResolvedValue(operations);

      await expect(service.findForList('user-1', 'list-1', '42')).resolves.toBe(
        operations,
      );
    });
  });

  describe('applyBatch', () => {
    beforeEach(() => {
      operationsRepository.existsBy.mockResolvedValue(false);
      dataSource.transaction.mockResolvedValue(buildList());
    });

    it('should apply a new operation and notify its participants', async () => {
      const results = await service.applyBatch([buildOperation()]);

      expect(results).toEqual([{ id: 'op-1', status: 'applied' }]);
      expect(eventEmitter.emit).toHaveBeenCalledWith('list.updated', {
        listId: 'list-1',
        userIdsToNotify: ['user-1', 'user-2'],
      });
    });

    it('should skip an operation that was already applied', async () => {
      operationsRepository.existsBy.mockResolvedValue(true);

      const results = await service.applyBatch([buildOperation()]);

      expect(operationsRepository.existsBy).toHaveBeenCalledWith({
        id: 'op-1',
      });
      expect(results).toEqual([{ id: 'op-1', status: 'skipped' }]);
      expect(dataSource.transaction).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should report a failed operation without interrupting the batch', async () => {
      dataSource.transaction
        .mockRejectedValueOnce(new Error('List not found'))
        .mockResolvedValueOnce(buildList({ id: 'list-2' }));

      const results = await service.applyBatch([
        buildOperation({ id: 'op-1' }),
        buildOperation({ id: 'op-2', payload: { listId: 'list-2' } }),
      ]);

      expect(results).toEqual([
        { id: 'op-1', status: 'failed', error: 'List not found' },
        { id: 'op-2', status: 'applied' },
      ]);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('should stringify a rejection that is not an error', async () => {
      dataSource.transaction.mockRejectedValue('unexpected');

      const results = await service.applyBatch([buildOperation()]);

      expect(results).toEqual([
        { id: 'op-1', status: 'failed', error: 'unexpected' },
      ]);
    });

    it('should notify a list only once per batch', async () => {
      const results = await service.applyBatch([
        buildOperation({ id: 'op-1' }),
        buildOperation({ id: 'op-2' }),
      ]);

      expect(results).toHaveLength(2);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('should notify each impacted list once', async () => {
      dataSource.transaction
        .mockResolvedValueOnce(buildList())
        .mockResolvedValueOnce(buildList({ id: 'list-2' }));

      await service.applyBatch([
        buildOperation({ id: 'op-1' }),
        buildOperation({ id: 'op-2', payload: { listId: 'list-2' } }),
      ]);

      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
      expect(eventEmitter.emit).toHaveBeenNthCalledWith(2, 'list.updated', {
        listId: 'list-2',
        userIdsToNotify: ['user-1', 'user-2'],
      });
    });

    it('should not notify when the list could not be reloaded', async () => {
      dataSource.transaction.mockResolvedValue(null);

      const results = await service.applyBatch([buildOperation()]);

      expect(results).toEqual([{ id: 'op-1', status: 'applied' }]);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should return no result for an empty batch', async () => {
      await expect(service.applyBatch([])).resolves.toEqual([]);
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('apply', () => {
    let manager: jest.Mocked<EntityManager>;
    let listRepository: jest.Mocked<Repository<List>>;
    let opRepository: jest.Mocked<Repository<Operation>>;
    let queryBuilder: QueryBuilderMock;
    let projector: jest.Mocked<OperationProjector>;

    beforeEach(() => {
      listRepository = buildMock<Repository<List>>([
        'findOne',
        'createQueryBuilder',
      ]);
      opRepository = buildMock<Repository<Operation>>(['insert']);
      manager = buildMock<EntityManager>(['getRepository']);
      projector = buildMock<OperationProjector>(['handle']);

      queryBuilder = buildQueryBuilder([{ current_sequence: '5' }]);
      listRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<List>,
      );
      listRepository.findOne.mockResolvedValue(buildList());
      projector.handle.mockResolvedValue(undefined);
      operationsHandler.for.mockReturnValue(projector);

      manager.getRepository.mockImplementation((entity) => {
        if (entity === List) {
          return listRepository as unknown as Repository<ObjectLiteral>;
        }

        return opRepository as unknown as Repository<ObjectLiteral>;
      });

      operationsRepository.existsBy.mockResolvedValue(false);
      dataSource.transaction.mockImplementation((runInTransaction) =>
        (runInTransaction as unknown as TransactionCallback)(manager),
      );
    });

    it('should lock the list for update before applying the operation', async () => {
      await service.applyBatch([buildOperation()]);

      expect(listRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: 'list-1' },
        lock: { mode: 'pessimistic_write' },
      });
    });

    it('should increment the list sequence and stamp it on the operation', async () => {
      const operation = buildOperation();

      await service.applyBatch([operation]);

      expect(queryBuilder.set).toHaveBeenCalledWith({
        currentSequence: expect.any(Function) as unknown,
      });
      expect(queryBuilder.where).toHaveBeenCalledWith('id = :id', {
        id: 'list-1',
      });
      expect(queryBuilder.returning).toHaveBeenCalledWith(['currentSequence']);
      expect(opRepository.insert).toHaveBeenCalledWith({
        ...operation,
        sequence: '5',
      });
    });

    it('should delegate the operation to the projector for its type', async () => {
      const operation = buildOperation({ type: OperationType.DELETE_LIST });

      await service.applyBatch([operation]);

      expect(operationsHandler.for).toHaveBeenCalledWith(
        OperationType.DELETE_LIST,
      );
      expect(projector.handle).toHaveBeenCalledWith(operation, manager);
    });

    it('should reload the list with its participants', async () => {
      await service.applyBatch([buildOperation()]);

      expect(listRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: 'list-1' },
        relations: ['participants'],
      });
    });

    it('should fail when the list is missing and the operation is not a creation', async () => {
      listRepository.findOne.mockResolvedValue(null);

      const results = await service.applyBatch([
        buildOperation({ type: OperationType.DELETE_LIST }),
      ]);

      expect(results).toEqual([
        { id: 'op-1', status: 'failed', error: 'List not found' },
      ]);
      expect(projector.handle).not.toHaveBeenCalled();
      expect(opRepository.insert).not.toHaveBeenCalled();
    });

    it('should apply a creation with sequence 0 when the list does not exist yet', async () => {
      listRepository.findOne.mockResolvedValue(null);
      const operation = buildOperation({ type: OperationType.CREATE_LIST });

      const results = await service.applyBatch([operation]);

      expect(results).toEqual([{ id: 'op-1', status: 'applied' }]);
      expect(listRepository.createQueryBuilder).not.toHaveBeenCalled();
      expect(opRepository.insert).toHaveBeenCalledWith({
        ...operation,
        sequence: '0',
      });
    });

    it('should still record the operation when the projector throws', async () => {
      projector.handle.mockRejectedValue(new Error('boom'));
      const operation = buildOperation();

      const results = await service.applyBatch([operation]);

      expect(results).toEqual([
        { id: 'op-1', status: 'failed', error: 'boom' },
      ]);
      expect(opRepository.insert).toHaveBeenCalledWith({
        ...operation,
        sequence: '5',
      });
    });

    it('should not fail when no projector is registered for the type', async () => {
      operationsHandler.for.mockReturnValue(undefined);

      const results = await service.applyBatch([buildOperation()]);

      expect(results).toEqual([{ id: 'op-1', status: 'applied' }]);
      expect(opRepository.insert).toHaveBeenCalled();
    });

    it('should fall back to sequence 0 when the update returns no row', async () => {
      queryBuilder = buildQueryBuilder([]);
      listRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as unknown as SelectQueryBuilder<List>,
      );
      const operation = buildOperation();

      await service.applyBatch([operation]);

      expect(opRepository.insert).toHaveBeenCalledWith({
        ...operation,
        sequence: '0',
      });
    });
  });

  type TransactionCallback = (manager: EntityManager) => Promise<List | null>;

  type QueryBuilderMock = {
    update: jest.Mock;
    set: jest.Mock;
    where: jest.Mock;
    returning: jest.Mock;
    execute: jest.Mock;
  };

  function buildQueryBuilder(raw: unknown[]): QueryBuilderMock {
    const queryBuilder: QueryBuilderMock = {
      update: jest.fn(),
      set: jest.fn(),
      where: jest.fn(),
      returning: jest.fn(),
      execute: jest.fn().mockResolvedValue({ raw }),
    };

    queryBuilder.update.mockReturnValue(queryBuilder);
    queryBuilder.set.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnValue(queryBuilder);
    queryBuilder.returning.mockReturnValue(queryBuilder);

    return queryBuilder;
  }

  function buildOperation(overrides: Partial<Operation> = {}): Operation {
    return {
      id: 'op-1',
      type: OperationType.CREATE_LIST,
      actorId: 'user-1',
      payload: { listId: 'list-1' },
      sequence: '1',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    };
  }

  function buildList(overrides: Partial<List> = {}): List {
    return {
      id: 'list-1',
      name: 'Groceries',
      participants: [{ id: 'user-1' }, { id: 'user-2' }],
      ...overrides,
    } as List;
  }
});
