import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Operation } from './models/operation.entity';
import { OperationsService } from './services/operations.service';
import { OperationsHandler } from './services/operations.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Operation])],
  providers: [OperationsService, OperationsHandler],
  exports: [OperationsService, OperationsHandler],
})
export class CoreModule {}
