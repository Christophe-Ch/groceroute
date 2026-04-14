import { SignUpDto } from '@auth/dto/sign-up.dto';
import { LoginResponse } from '@auth/models/login-response';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@users/models/user.entity';
import { UsersService } from '@users/services/users.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  public async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && bcrypt.compareSync(pass, user.password)) {
      return user;
    }

    return null;
  }

  public async login(user: User): Promise<LoginResponse> {
    user.refreshToken = uuidv4();
    await this.usersService.update(user);

    return {
      token: await this.jwtService.signAsync({
        sub: user.email,
      }),
      refreshToken: user.refreshToken,
    };
  }

  public async signUp(signUpDto: SignUpDto): Promise<LoginResponse> {
    const user = await this.usersService.findByEmail(signUpDto.email);
    if (user) {
      throw new BadRequestException(
        'This email address is already associated to an account.',
      );
    }

    const created = await this.usersService.create(
      signUpDto.email,
      bcrypt.hashSync(signUpDto.password, 10),
    );

    return this.login(created);
  }

  public async refresh(
    user: User,
    refreshToken: string,
  ): Promise<LoginResponse> {
    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException(
        "The refresh token doesn't match the connected user.",
      );
    }

    return this.login(user);
  }
}
