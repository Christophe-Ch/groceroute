import { CoreModule } from '@core/core.module';
import { Module } from '@nestjs/common';
import { SyncController } from './controllers/sync.controller';
import { SyncService } from './services/sync.service';

@Module({
  imports: [CoreModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
