import { JwtAuthGuard } from '@auth/strategies/jwt.strategy';
import { Operation } from '@core/models/operation.entity';
import { OperationsService } from '@core/services/operations.service';
import { Body, Controller, Post, Req, Sse, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from '@utils/types/authenticated-request';
import { OperationSyncResultDto } from '../dto/operation-sync-result.dto';
import { PushOperationsDto } from '../dto/push-operations.dto';
import { SyncService } from '../services/sync.service';

@Controller('sync')
export class SyncController {
  constructor(
    private readonly operationsService: OperationsService,
    private readonly syncService: SyncService,
  ) {}

  @Post('push')
  @UseGuards(JwtAuthGuard)
  public async push(
    @Body() dto: PushOperationsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<OperationSyncResultDto[]> {
    const result = await this.operationsService.applyBatch(
      dto.operations.map((op) => ({
        id: op.id,
        type: op.type,
        actorId: req.user.id,
        payload: op.payload,
      })) as Operation[],
    );

    this.syncService.broadcastUpdate({
      listId: dto.operations[0].payload.listId,
      actorId: req.user.id,
      userIdsToNotify: [req.user.id],
    });

    return result;
  }

  @Sse('stream')
  @UseGuards(JwtAuthGuard)
  public sendUpdates(@Req() req: AuthenticatedRequest) {
    return this.syncService.getUpdateStream(req.user.id);
  }
}
