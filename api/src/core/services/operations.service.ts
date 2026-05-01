import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OperationSyncResultDto } from 'src/sync/dto/operation-sync-result.dto';
import { Repository } from 'typeorm';
import { Operation } from '../models/operation.entity';
import { OperationsHandler } from './operations.handler';

@Injectable()
export class OperationsService {
  constructor(
    @InjectRepository(Operation)
    private operationsRepository: Repository<Operation>,
    private operationsHandler: OperationsHandler,
  ) {}

  public async apply(operation: Operation): Promise<'applied' | 'skipped'> {
    if (await this.operationsRepository.existsBy({ id: operation.id }))
      return 'skipped';

    await this.operationsRepository.insert(operation);
    await this.operationsHandler.handle(operation);
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
}
