import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { PushOperationDto } from './push-operation.dto';

export class PushOperationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PushOperationDto)
  operations: PushOperationDto[];
}
