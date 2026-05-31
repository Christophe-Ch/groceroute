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
      case OperationType.START_SHOPPING:
      case OperationType.ABANDON_SHOPPING:
      case OperationType.FINISH_SHOPPING:
        await this.listProjector.handle(operation);
        break;
    }
  }
}
