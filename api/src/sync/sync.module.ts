import { CoreModule } from '@core/core.module';
import { Module } from '@nestjs/common';
import { SyncController } from './controllers/sync.controller';

@Module({
  imports: [CoreModule],
  controllers: [SyncController],
})
export class SyncModule {}
