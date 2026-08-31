import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { OperationSyncResultDto } from 'src/sync/dto/operation-sync-result.dto';
import { DataSource, JsonContains, MoreThan, Not, Repository } from 'typeorm';
import { Operation } from '../models/operation.entity';
import { OperationsHandler } from './operations.handler';
import { List } from '@lists/models/list.entity';
import { OperationType } from '@core/models/operation-type.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';

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
