import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsController } from './controllers/lists.controller';
import { Distance } from './models/distance.entity';
import { Item } from './models/item.entity';
import { List } from './models/list.entity';
import { ListsService } from './services/lists.service';
import { ListProjector } from './projectors/list.projector';

@Module({
  imports: [TypeOrmModule.forFeature([List, Item, Distance])],
  providers: [ListsService, ListProjector],
  controllers: [ListsController],
  exports: [ListsService, ListProjector],
})
export class ListsModule {}
