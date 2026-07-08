import { AuthModule } from '@auth/auth.module';
import entities from '@db/entities';
import { SnakeCaseNamingStrategy } from '@db/utils/snake-case-naming-strategy';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@users/users.module';
import { CoreModule } from './core/core.module';
import { ListsModule } from './lists/lists.module';
import { SyncModule } from './sync/sync.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: false, delimiter: '.' }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities,
        namingStrategy: new SnakeCaseNamingStrategy(),
      }),
    }),
    UsersModule,
    AuthModule,
    ListsModule,
    CoreModule,
    SyncModule,
  ],
})
export class AppModule {}
