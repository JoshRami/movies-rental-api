import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { mockUserModel } from '../users/mocks/user-mocks';
import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import * as TokenMocks from '../tokens/mocks/tockens.mocks';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findByCredentials: jest.fn().mockReturnValue(mockUserModel),
  };
  const mockJwtService = {
    sign: jest.fn().mockReturnValue(TokenMocks.token),
    decode: jest.fn().mockReturnValue({ exp: 500 }),
  };
  const mockTokensService = {
    saveToken: jest.fn().mockReturnValue(TokenMocks.token),
  };
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
      const { email, password } = mockUserModel;
      const user = await service.validateUser(email, password);
      expect(user).toBe(mockUserModel);
    });
  });

  describe('While loging', () => {
    it('should return an access token', async () => {
      const { email, id } = mockUserModel;

      const token = await service.login({ email, id });
      expect(token).toBe(TokenMocks.token.token);
    });
  });
});
