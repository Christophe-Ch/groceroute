import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { OperationSyncResultDto } from 'src/sync/dto/operation-sync-result.dto';
import { DataSource, JsonContains, MoreThan, Not, Repository } from 'typeorm';
import { Operation } from '../models/operation.entity';
import { OperationsHandler } from './operations.handler';
import { List } from '@lists/models/list.entity';
import { OperationType } from '@core/models/operation-type.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AddParticipantOperation } from '@lists/operations/list/add-participant.operation';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(Operation)
    private operationsRepository: Repository<Operation>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private operationsHandler: OperationsHandler,
    private eventEmitter: EventEmitter2,
  ) {}

  public async findForList(
    userId: string,
    listId: string,
    lastSequence: string,
  ): Promise<Operation[]> {
    return this.operationsRepository.find({
      where: {
        actorId: Not(userId),
        payload: JsonContains({
          listId,
        }),
        sequence: MoreThan(lastSequence),
      },
    });
  }

  public async applyBatch(
    operations: Operation[],
  ): Promise<OperationSyncResultDto[]> {
    const results: OperationSyncResultDto[] = [];
    const lists = new Map<string, List>();
    for (const operation of operations) {
      try {
        const { list, status } = await this.apply(operation);
        results.push({ id: operation.id, status });
        if (list) {
          lists.set(list.id, list);
        }
      } catch (error) {
        results.push({
          id: operation.id,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.notifyListSubscribers(Array.from(lists.values()));

    return results;
  }

  private notifyListSubscribers(lists: List[]): void {
    lists.forEach((list) => {
      this.eventEmitter.emit('list.updated', {
        listId: list.id,
        userIdsToNotify: list.participants.map((p) => p.id),
      });
    });
  }

  private async apply(
    operation: Operation,
  ): Promise<{ list: List | null; status: 'applied' | 'skipped' }> {
    if (await this.operationsRepository.existsBy({ id: operation.id })) {
      return { list: null, status: 'skipped' };
    }

    const list = await this.dataSource.transaction(async (manager) => {
      const listRepository = manager.getRepository(List);
      const opRepository = manager.getRepository(Operation);

      const list = await listRepository.findOne({
        where: { id: operation.payload.listId },
        lock: { mode: 'pessimistic_write' },
      });

      this.checkListExistsIfRequired(list, operation);
      await this.authorizeActor(list, operation, listRepository);

      const currentSequence = await this.getListCurrentSequence(
        list,
        listRepository,
      );

      try {
        await this.operationsHandler
          .for(operation.type)
          ?.handle(operation, manager);
      } finally {
        await opRepository.insert({
          ...operation,
          sequence: currentSequence,
        });
      }

      return listRepository.findOne({
        where: { id: operation.payload.listId },
        relations: ['participants'],
      });
    });

    return {
      list,
      status: 'applied',
    };
  }

  private checkListExistsIfRequired(
    list: List | null,
    operation: Operation,
  ): void {
    if (!list && operation.type !== OperationType.CREATE_LIST) {
      throw new Error('List not found');
    }
  }

  private async authorizeActor(
    list: List | null,
    operation: Operation,
    listRepository: Repository<List>,
  ): Promise<void> {
    switch (operation.type) {
      case OperationType.CREATE_LIST:
        this.checkListDoesNotExist(list);
        break;
      case OperationType.ADD_PARTICIPANT:
        this.checkParticipantIsActor(operation);
        break;
      default:
        await this.checkActorIsParticipant(operation, listRepository);
    }
  }

  private checkListDoesNotExist(list: List | null): void {
    if (list) {
      throw new ForbiddenException(`List ${list.id} already exists`);
    }
  }

  private checkParticipantIsActor(operation: Operation): void {
    const { participant } = (operation as AddParticipantOperation).payload;

    if (participant?.id !== operation.actorId) {
      throw new ForbiddenException(
        'An actor may only add itself as a participant',
      );
    }
  }

  private async checkActorIsParticipant(
    operation: Operation,
    listRepository: Repository<List>,
  ): Promise<void> {
    const isParticipant = await listRepository.existsBy({
      id: operation.payload.listId,
      participants: { id: operation.actorId },
    });

    if (!isParticipant) {
      throw new ForbiddenException(
        `Actor ${operation.actorId} is not a participant of list ${operation.payload.listId}`,
      );
    }
  }

  private async getListCurrentSequence(
    list: List | null,
    listRepository: Repository<List>,
  ): Promise<string> {
    if (!list) {
      return '0';
    }

    const result = await listRepository
      .createQueryBuilder()
      .update()
      .set({ currentSequence: () => 'currentSequence + 1' })
      .where('id = :id', { id: list.id })
      .returning(['currentSequence'])
      .execute();

    const row = (result.raw as Array<{ current_sequence: string }>)[0] as
      | { current_sequence: string }
      | undefined;

    if (row) {
      return row['current_sequence'];
    }

    return '0';
  }
}
