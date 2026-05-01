import { JwtAuthGuard } from '@auth/strategies/jwt.strategy';
import { OperationsService } from '@core/services/operations.service';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from '@utils/types/authenticated-request';
import { OperationSyncResultDto } from '../dto/operation-sync-result.dto';
import { PushOperationsDto } from '../dto/push-operations.dto';

@Controller('sync')
export class SyncController {
  constructor(private readonly operationsService: OperationsService) {}

  @Post('push')
  @UseGuards(JwtAuthGuard)
  public async push(
    @Body() dto: PushOperationsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<OperationSyncResultDto[]> {
    return this.operationsService.applyBatch(
      dto.operations.map((op) => ({
        id: op.id,
        type: op.type,
        actorId: req.user.id,
        payload: op.payload,
        sequence: null,
      })),
    );
  }
}
