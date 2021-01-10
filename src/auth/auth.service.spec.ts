import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { mockUserModel } from '../users/mocks/user-mocks';
import { TokensService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import * as TokenMocks from '../tokens/mocks/tockens.mocks';
import { PasswordTokenService } from './password-tokens/password-tokens.service';
import { mockTokenPasswordModel } from './password-tokens/mocks/password-tocken.mocks';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findByCredentials: jest.fn().mockReturnValue(mockUserModel),
    changeUserPassword: jest.fn().mockReturnValue(Promise.resolve()),
    getUserByEmail: jest.fn().mockReturnValue(mockUserModel),
  };
  const mockJwtService = {
    sign: jest.fn().mockReturnValue(TokenMocks.token),
    decode: jest.fn().mockReturnValue({ exp: 500 }),
  };
  const mockTokensService = {
    saveToken: jest.fn().mockReturnValue(TokenMocks.token),
  };

  const mockPasswordTokenService = {
    validatePasswordToken: jest.fn().mockReturnValue(Promise.resolve()),
    generatePasswordToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: TokensService, useValue: mockTokensService },
        { provide: PasswordTokenService, useValue: mockPasswordTokenService },
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

  describe('While changing user password', () => {
    it('should not throw error', async () => {
      const { id } = mockUserModel;
      const newPassword = 'newPassword';
      await service.changeUserPassword(id, { password: newPassword });
      expect(mockUserService.changeUserPassword).toBeCalledWith(
        id,
        newPassword,
      );
    });
  });

  describe('While reseting password for an user', () => {
    it('should not throw error', async () => {
      const { token, user } = mockTokenPasswordModel;
      await service.resetPassword({
        token,
        email: user.email,
        password: 'newPassword',
      });
      expect(mockPasswordTokenService.validatePasswordToken).toBeCalledWith(
        token,
        user.email,
      );
      expect(mockUserService.changeUserPassword).toBeCalledWith(
        user.id,
        'newPassword',
      );
    });
  });

  describe('When asking to reset password', () => {
    it('should not throw error', async () => {
      const { email } = mockUserModel;
      await service.askResetPassword({ email });
      expect(mockPasswordTokenService.generatePasswordToken).toBeCalledWith(
        email,
      );
    });
  });
});
