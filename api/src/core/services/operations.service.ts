import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  public async apply(operation: Operation): Promise<void> {
    if (await this.operationsRepository.existsBy({ id: operation.id })) return;

    await this.operationsRepository.insert(operation);

    await this.operationsHandler.handle(operation);
  }
}
