import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { mockUserModel } from '../users/mocks/user-mocks';
import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findByCredentials: jest.fn().mockReturnValue(mockUserModel),
  };
  const mockJwtService = {};
  const mockTokensService = {};
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: TokensService, useValue: mockTokensService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('While validating an user,', () => {
    it('should return a validated user', async () => {
      const { username, password } = mockUserModel;
      const user = await service.validateUser(username, password);
      expect(user).toBe(mockUserModel);
    });
  });
});
