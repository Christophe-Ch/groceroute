import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '@users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard, JwtStrategy } from './strategies/jwt.strategy';
import { StringValue } from 'ms';
import {
  RefreshTokenAuthGuard,
  RefreshTokenStrategy,
} from './strategies/refresh-token.strategy';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<StringValue>('JWT_EXPIRATION'),
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    RefreshTokenStrategy,
    RefreshTokenAuthGuard,
  ],
  controllers: [AuthController],
  exports: [JwtStrategy, JwtAuthGuard],
})
export class AuthModule {}
