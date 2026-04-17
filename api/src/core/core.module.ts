import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { ListsModule } from 'src/lists/lists.module';
import { Operation } from './models/operation.entity';
import { OperationsService } from './services/operations.service';
import { OperationsHandler } from './services/operations.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Operation]), ListsModule],
  providers: [OperationsService, OperationsHandler],
  exports: [OperationsService],
})
export class CoreModule {}
