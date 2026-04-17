import { OperationType } from '@core/models/operation-type.enum';
import { IsEnum, IsObject, IsUUID } from 'class-validator';

export class PushOperationDto {
  @IsUUID()
  id: string;

  @IsEnum(OperationType)
  type: OperationType;

  @IsObject()
  payload: Record<string, any>;
}
