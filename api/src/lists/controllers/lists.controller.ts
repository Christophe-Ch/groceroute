import { JwtAuthGuard } from '@auth/strategies/jwt.strategy';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from '@utils/types/authenticated-request';
import { CreateListDto } from '../dto/create-list.dto';
import { ListsService } from '../services/lists.service';
import { OperationsService } from '@core/services/operations.service';
import { OperationType } from '@core/models/operation-type.enum';
import { generateId } from '@utils/generate-id';
import { AddParticipantOperation } from '@lists/operations/list/add-participant.operation';

@Controller('lists')
export class ListsController {
  constructor(
    private readonly listsService: ListsService,
    private readonly operationsService: OperationsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  public async create(
    @Body() createListDto: CreateListDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.create(createListDto, req.user);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  public async join(
    @Param('id') listId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    await this.operationsService.applyBatch([
      {
        id: generateId(),
        type: OperationType.ADD_PARTICIPANT,
        actorId: req.user.id,
        payload: {
          listId,
          participant: req.user,
        },
        createdAt: new Date(),
      } as AddParticipantOperation,
    ]);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  public async findAllByUser(@Req() req: AuthenticatedRequest) {
    return this.listsService.findAllByUser(req.user);
  }
}
