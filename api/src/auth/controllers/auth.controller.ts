import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '@auth/services/auth.service';
import { LocalAuthGuard } from '@auth/strategies/local.strategy';
import { SignUpDto } from '@auth/dto/sign-up.dto';
import { JwtAuthGuard } from '@auth/strategies/jwt.strategy';
import { AuthenticatedRequest } from '@utils/types/authenticated-request';
import { RefreshTokenDto } from '@auth/dto/refresh-token.dto';
import { RefreshTokenAuthGuard } from '@auth/strategies/refresh-token.strategy';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: AuthenticatedRequest) {
    return await this.authService.login(req.user);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenAuthGuard)
  async refresh(
    @Req() req: AuthenticatedRequest,
    @Body() { refreshToken }: RefreshTokenDto,
  ) {
    return await this.authService.refresh(req.user, refreshToken);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  check() {
    // Check performed by guard
  }
}
