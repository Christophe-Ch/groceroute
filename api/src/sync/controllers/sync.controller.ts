import { JwtAuthGuard } from '@auth/strategies/jwt.strategy';
import { Operation } from '@core/models/operation.entity';
import { OperationsService } from '@core/services/operations.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Sse,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from '@utils/types/authenticated-request';
import { OperationSyncResultDto } from '../dto/operation-sync-result.dto';
import { PushOperationsDto } from '../dto/push-operations.dto';
import { SyncService } from '../services/sync.service';
import { ListsService } from '@lists/services/lists.service';

@Controller('sync')
export class SyncController {
  constructor(
    private readonly operationsService: OperationsService,
    private readonly syncService: SyncService,
    private readonly listsService: ListsService,
  ) {}

  @Post('push')
  @UseGuards(JwtAuthGuard)
  public async push(
    @Body() dto: PushOperationsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<OperationSyncResultDto[]> {
    if (dto.operations.length === 0) return;

    const listId = dto.operations[0].payload.listId;
    const userIdsToNotify = (
      await this.listsService.getParticipantIds(listId)
    ).filter((id) => id !== req.user.id);

    const result = await this.operationsService.applyBatch(
      dto.operations.map((op) => ({
        id: op.id,
        type: op.type,
        actorId: req.user.id,
        payload: op.payload,
      })) as Operation[],
    );

    void this.syncService.broadcastUpdate({
      listId,
      actorId: req.user.id,
      userIdsToNotify,
    });

    return result;
  }

  @Get('pull')
  @UseGuards(JwtAuthGuard)
  public async pull(
    @Query('listId') listId: string,
    @Query('lastSequence') lastSequence: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const [operations, currentSequence] = await Promise.all([
      this.operationsService.findForList(req.user.id, listId, lastSequence),
      this.listsService.getListCurrentSequence(listId),
    ]);

    return {
      operations,
      currentSequence,
    };
  }

  @Sse('stream')
  @UseGuards(JwtAuthGuard)
  public sendUpdates(@Req() req: AuthenticatedRequest) {
    return this.syncService.getUpdateStream(req.user.id);
  }
}
