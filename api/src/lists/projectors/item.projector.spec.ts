import { OperationType } from '@core/models/operation-type.enum';
import { Operation } from '@core/models/operation.entity';
import { OperationsHandler } from '@core/services/operations.handler';
import { Item } from '@lists/models/item.entity';
import { EntityManager, Repository } from 'typeorm';
import { ItemProjector } from './item.projector';

describe('ItemProjector', () => {
  let projector: ItemProjector;
  let itemRepository: jest.Mocked<Repository<Item>>;
  let operationsHandler: jest.Mocked<OperationsHandler>;
  let getRepository: jest.Mock;
  let entityManager: EntityManager;
  const actorId = 'actor';
  const listId = 'list';
  const itemId = 'item';

  beforeEach(() => {
    itemRepository = {
      existsBy: jest.fn().mockResolvedValue(false),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<Item>>;
    getRepository = jest.fn(() => itemRepository);
    entityManager = { getRepository } as unknown as jest.Mocked<EntityManager>;
    operationsHandler = {
      register: jest.fn(),
    } as unknown as jest.Mocked<OperationsHandler>;

    projector = new ItemProjector(operationsHandler);
  });

  const handle = (type: OperationType, payload: object = {}) => {
    const operation = {
      type,
      payload,
      actorId,
    } as unknown as Operation;

    return projector.handle(operation, entityManager).then(() => operation);
  };

  const expectNoWrites = () => {
    expect(itemRepository.insert).not.toHaveBeenCalled();
    expect(itemRepository.update).not.toHaveBeenCalled();
    expect(itemRepository.delete).not.toHaveBeenCalled();
  };

  describe('registration', () => {
    it('should register itself on the operations handler', () => {
      expect(operationsHandler.register).toHaveBeenCalledWith(projector);
    });

    it('should handle only the item operation types', () => {
      expect(projector.handles).toEqual([
        OperationType.ADD_ITEM,
        OperationType.DELETE_ITEM,
        OperationType.CHECK_ITEM,
        OperationType.UNCHECK_ITEM,
        OperationType.SET_ITEM_QUANTITY,
      ]);
    });
  });

  describe('dispatch', () => {
    it('should take the item repository from the given manager', async () => {
      await handle(OperationType.ADD_ITEM, {
        id: itemId,
        listId,
        name: 'Milk',
      });

      expect(getRepository).toHaveBeenCalledWith(Item);
    });

    it.each([
      OperationType.CREATE_LIST,
      OperationType.RENAME_ITEM,
      OperationType.REORDER_ITEMS,
    ])('should do nothing for %s', async (type) => {
      await handle(type, { itemId, listId });

      expectNoWrites();
    });
  });

  describe('ADD_ITEM', () => {
    it('should insert the item', async () => {
      await handle(OperationType.ADD_ITEM, {
        id: itemId,
        listId,
        name: 'Milk',
      });

      expect(itemRepository.insert).toHaveBeenCalledWith({
        id: itemId,
        listId,
        name: 'Milk',
      });
      expect(itemRepository.update).not.toHaveBeenCalled();
      expect(itemRepository.delete).not.toHaveBeenCalled();
    });

    it('should not insert the item twice if it already exists', async () => {
      itemRepository.existsBy.mockResolvedValueOnce(true);

      await handle(OperationType.ADD_ITEM, {
        id: itemId,
        listId,
        name: 'Milk',
      });

      expect(itemRepository.insert).not.toHaveBeenCalled();
    });
  });

  describe('DELETE_ITEM', () => {
    it('should delete the item scoped to its list', async () => {
      await handle(OperationType.DELETE_ITEM, { itemId, listId });

      expect(itemRepository.delete).toHaveBeenCalledWith({
        id: itemId,
        listId,
      });
    });
  });

  describe.each([
    [OperationType.CHECK_ITEM, {}, { checked: true }],
    [OperationType.UNCHECK_ITEM, {}, { checked: false }],
    [OperationType.SET_ITEM_QUANTITY, { quantity: '3' }, { quantity: '3' }],
  ])('%s', (type, extraPayload, expectedUpdate) => {
    it(`should update the item with ${JSON.stringify(expectedUpdate)}`, async () => {
      await handle(type, { itemId, listId, ...extraPayload });

      expect(itemRepository.update).toHaveBeenCalledWith(
        { id: itemId, listId },
        expectedUpdate,
      );
    });

    it('should scope the update to the item list', async () => {
      await handle(type, { itemId, listId, ...extraPayload });

      const [criteria] = itemRepository.update.mock.calls[0];
      expect(criteria).toEqual({ id: itemId, listId });
    });
  });

  describe('SET_ITEM_QUANTITY', () => {
    it('should pass an empty quantity through', async () => {
      await handle(OperationType.SET_ITEM_QUANTITY, {
        itemId,
        listId,
        quantity: '',
      });

      expect(itemRepository.update).toHaveBeenCalledWith(
        { id: itemId, listId },
        { quantity: '' },
      );
    });
  });
});
