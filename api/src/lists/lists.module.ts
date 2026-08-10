import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsController } from './controllers/lists.controller';
import { Distance } from './models/distance.entity';
import { Item } from './models/item.entity';
import { List } from './models/list.entity';
import { ListsService } from './services/lists.service';
import { ListProjector } from './projectors/list.projector';
import { CoreModule } from '@core/core.module';
import { ItemProjector } from './projectors/item.projector';

@Module({
  imports: [TypeOrmModule.forFeature([List, Item, Distance]), CoreModule],
  providers: [ListsService, ListProjector, ItemProjector],
  controllers: [ListsController],
  exports: [ListsService, ListProjector],
})
export class ListsModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_: ListProjector, __: ItemProjector) {}
}
