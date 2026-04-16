import { IsNotEmpty, IsString } from 'class-validator';

export class CreateListDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
