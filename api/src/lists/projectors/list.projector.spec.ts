import { ListsService } from '@lists/services/lists.service';
import { ListProjector } from './list.projector';
import { OperationsHandler } from '@core/services/operations.handler';
import { OperationType } from '@core/models/operation-type.enum';
import { EntityManager, Repository } from 'typeorm';
import { List } from '@lists/models/list.entity';
import { Operation } from '@core/models/operation.entity';
import { User } from '@users/models/user.entity';

describe('ListProjector', () => {
  let projector: ListProjector;
  let listsService: jest.Mocked<ListsService>;
  let listsRepository: jest.Mocked<Repository<List>>;
  let usersRepository: jest.Mocked<Repository<User>>;
  let operationsHandler: jest.Mocked<OperationsHandler>;
  let withTransaction: jest.Mock;
  let entityManager: EntityManager;
  const actor = { id: 'actor', email: 'actor@mail.com' };

  beforeEach(() => {
    withTransaction = jest.fn(() => listsService);
    listsService = {
      withTransaction,
      addParticipant: jest.fn(),
      isParticipant: jest.fn(),
    } as unknown as jest.Mocked<ListsService>;
    listsRepository = {
      existsBy: jest.fn(),
      insert: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<List>>;
    usersRepository = {
      findOneBy: jest.fn().mockResolvedValue(actor),
    } as unknown as jest.Mocked<Repository<User>>;
    entityManager = {
      getRepository: (repositoryType) =>
        repositoryType === List ? listsRepository : usersRepository,
    } as unknown as jest.Mocked<EntityManager>;
    operationsHandler = {
      register: jest.fn(),
    } as unknown as jest.Mocked<OperationsHandler>;

    projector = new ListProjector(listsService, operationsHandler);
  });

  const handle = (type: OperationType, payload: object = {}) => {
    const operation = {
      type,
      payload,
      actorId: actor.id,
    } as unknown as Operation;

    return projector.handle(operation, entityManager).then(() => operation);
  };

  describe('registration', () => {
    it('should register itself on the operations handler', () => {
      expect(operationsHandler.register).toHaveBeenCalledWith(projector);
    });

    it('should handle only the list operation types', () => {
      expect(projector.handles).toEqual([
        OperationType.CREATE_LIST,
        OperationType.DELETE_LIST,
        OperationType.START_SHOPPING,
        OperationType.ABANDON_SHOPPING,
        OperationType.FINISH_SHOPPING,
        OperationType.ADD_PARTICIPANT,
      ]);
    });
  });

  describe('dispatch', () => {
    it('should bind the lists service to the given manager', async () => {
      listsRepository.existsBy.mockResolvedValueOnce(true);

      await handle(OperationType.CREATE_LIST, { listId: '1', name: 'A list' });

      expect(withTransaction).toHaveBeenCalledWith(entityManager);
    });

    it('should do nothing for an unsupported operation type', async () => {
      await handle(OperationType.ADD_ITEM, { listId: '1' });

      expect(listsRepository.insert).not.toHaveBeenCalled();
      expect(listsRepository.save).not.toHaveBeenCalled();
      expect(listsRepository.update).not.toHaveBeenCalled();
      expect(listsRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('CREATE_LIST', () => {
    it('should create list', async () => {
      listsRepository.existsBy.mockResolvedValueOnce(false);

      const payload = {
        listId: '1',
        name: 'Some list',
      };

      const operation = await handle(OperationType.CREATE_LIST, payload);

      expect(listsRepository.insert).toHaveBeenCalledWith({
        id: payload.listId,
        name: payload.name,
      });
      expect(listsService.addParticipant).toHaveBeenCalledWith(
        payload.listId,
        'actor',
      );
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: actor.id });
      expect(operation.payload.owner).toEqual(actor);
    });
  });

  describe('ADD_PARTICIPANT', () => {
    const participant = { id: 'participant', email: 'participant@mail.com' };

    it('should add the participant to the list', async () => {
      const list = { id: '1', participants: [actor] };
      listsRepository.findOne.mockResolvedValueOnce(list as List);

      await handle(OperationType.ADD_PARTICIPANT, {
        listId: '1',
        participant,
      });

      expect(listsRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['participants'],
      });
      expect(list.participants).toEqual([actor, participant]);
      expect(listsRepository.save).toHaveBeenCalledWith(list);
    });

    it('should do nothing if the list does not exist', async () => {
      listsRepository.findOne.mockResolvedValueOnce(null);

      await handle(OperationType.ADD_PARTICIPANT, {
        listId: '1',
        participant,
      });

      expect(listsRepository.save).not.toHaveBeenCalled();
    });

    it('should do nothing if the user is already a participant', async () => {
      const list = { id: '1', participants: [participant] };
      listsRepository.findOne.mockResolvedValueOnce(list as List);

      await handle(OperationType.ADD_PARTICIPANT, {
        listId: '1',
        participant,
      });

      expect(list.participants).toEqual([participant]);
      expect(listsRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('DELETE_LIST', () => {
    it('should delete the list', async () => {
      await handle(OperationType.DELETE_LIST, { listId: '1' });

      expect(listsRepository.delete).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe.each([
    [OperationType.START_SHOPPING, 'play'],
    [OperationType.ABANDON_SHOPPING, 'edit'],
    [OperationType.FINISH_SHOPPING, 'edit'],
  ])('%s', (type, mode) => {
    it(`should set the list mode to ${mode}`, async () => {
      await handle(type, { listId: '1' });

      expect(listsRepository.update).toHaveBeenCalledWith(
        { id: '1' },
        { mode },
      );
    });
  });
});
