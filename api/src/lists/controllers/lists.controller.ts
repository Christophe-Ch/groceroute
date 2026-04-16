import { JwtAuthGuard } from '@auth/strategies/jwt.strategy';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from '@utils/types/authenticated-request';
import { CreateListDto } from '../dto/create-list.dto';
import { ListsService } from '../services/lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  public async create(
    @Body() createListDto: CreateListDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.listsService.create(createListDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  public async findAllByUser(@Req() req: AuthenticatedRequest) {
    return this.listsService.findAllByUser(req.user);
  }
}
