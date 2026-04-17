import { Injectable } from '@nestjs/common';
import { ListProjector } from 'src/lists/projectors/list.projector';
import { OperationType } from '../models/operation-type.enum';
import { Operation } from '../models/operation.entity';

@Injectable()
export class OperationsHandler {
  constructor(private readonly listProjector: ListProjector) {}

  public async handle(operation: Operation): Promise<void> {
    switch (operation.type) {
      case OperationType.CREATE_LIST:
        await this.listProjector.handle(operation);
        break;
    }
  }
}
