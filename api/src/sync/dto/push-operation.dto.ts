import { OperationType } from '@core/models/operation-type.enum';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsObject, IsUUID } from 'class-validator';

export class PushOperationDto {
  @IsUUID()
  id: string;

  @IsEnum(OperationType)
  type: OperationType;

  @IsObject()
  payload: { listId: string } & Record<string, any>;

  @Type(() => Date)
  @IsDate()
  createdAt: Date;
}
