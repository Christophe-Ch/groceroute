import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '@users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@users/models/user.entity';
import { BadRequestException } from '@nestjs/common';

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  password: 'hashed',
  refreshToken: '',
} as User;

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('returns token and refreshToken after creating the user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockUsersService.update.mockResolvedValue(undefined);
      mockJwtService.signAsync.mockResolvedValue('access-token');

      const result = await service.signUp({
        email: 'test@example.com',
        password: 'Password1!',
      });

      expect(mockUsersService.create).toHaveBeenCalledWith(
        'test@example.com',
        expect.stringMatching(/^\$2[aby]\$/), // bcrypt hash prefix
      );
      expect(result).toHaveProperty('token', 'access-token');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.refreshToken).toBe('string');
    });

    it('throws BadRequestException when email is already taken', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.signUp({ email: 'test@example.com', password: 'Password1!' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
