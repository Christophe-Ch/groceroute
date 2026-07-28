import { Injectable } from '@nestjs/common';
import { OperationType } from '../models/operation-type.enum';
import { OperationProjector } from '@core/projectors/operation-projector';

@Injectable()
export class OperationsHandler {
  private handlers = new Map<OperationType, OperationProjector>();

  public for(type: OperationType) {
    return this.handlers.get(type);
  }

  public register(projector: OperationProjector) {
    projector.handles.forEach((type) => this.handlers.set(type, projector));
  }
}
