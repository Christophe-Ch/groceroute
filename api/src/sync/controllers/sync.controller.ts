import { JwtAuthGuard } from '@auth/strategies/jwt.strategy';
import { OperationsService } from '@core/services/operations.service';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from '@utils/types/authenticated-request';
import { PushOperationDto } from '../dto/push-operation.dto';

@Controller('sync')
export class SyncController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post('push')
  @UseGuards(JwtAuthGuard)
  public async push(
    @Body() dto: PushOperationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.operationsService.apply({
      id: dto.id,
      type: dto.type,
      actorId: req.user.id,
      payload: dto.payload,
      sequence: null,
    });
  }
}
