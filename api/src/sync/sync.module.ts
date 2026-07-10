import { CoreModule } from '@core/core.module';
import { Module } from '@nestjs/common';
import { SyncController } from './controllers/sync.controller';
import { SyncService } from './services/sync.service';
import { ListsModule } from 'src/lists/lists.module';

@Module({
  imports: [CoreModule, ListsModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
