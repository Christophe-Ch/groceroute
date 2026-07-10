import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { OperationSyncResultDto } from 'src/sync/dto/operation-sync-result.dto';
import { DataSource, JsonContains, MoreThan, Repository } from 'typeorm';
import { Operation } from '../models/operation.entity';
import { OperationsHandler } from './operations.handler';
import { List } from '@lists/models/list.entity';
import { OperationType } from '@core/models/operation-type.enum';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(Operation)
    private operationsRepository: Repository<Operation>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private operationsHandler: OperationsHandler,
  ) {}

  public async apply(operation: Operation): Promise<'applied' | 'skipped'> {
    if (await this.operationsRepository.existsBy({ id: operation.id })) {
      return 'skipped';
    }

    await this.dataSource.transaction(async (manager) => {
      const listRepository = manager.getRepository(List);
      const opRepository = manager.getRepository(Operation);

      const list = await listRepository.findOne({
        where: { id: operation.payload.listId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!list && operation.type !== OperationType.CREATE_LIST) {
        throw new Error('List not found');
      }

      let currentSequence = '0';
      if (list) {
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
          currentSequence = row['current_sequence'];
        }
      }

      await opRepository.insert({
        ...operation,
        sequence: currentSequence,
      });

      await this.operationsHandler.handle(operation, manager);
    });

    return 'applied';
  }

  public async applyBatch(
    operations: Operation[],
  ): Promise<OperationSyncResultDto[]> {
    const results: OperationSyncResultDto[] = [];
    for (const operation of operations) {
      try {
        const status = await this.apply(operation);
        results.push({ id: operation.id, status });
      } catch (error) {
        results.push({
          id: operation.id,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return results;
  }

  public async findForList(
    listId: string,
    lastSequence: string,
  ): Promise<Operation[]> {
    return this.operationsRepository.find({
      where: {
        payload: JsonContains({
          listId,
        }),
        sequence: MoreThan(lastSequence),
      },
    });
  }
}
