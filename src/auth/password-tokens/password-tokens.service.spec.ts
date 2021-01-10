import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockUserModel } from '../../users/mocks/user-mocks';
import { UsersService } from '../../users/users.service';
import { PasswordTokenService } from './password-tokens.service';
import { PasswordToken } from './passwords-token.entity';
import * as mockPasswordToken from './mocks/password-tocken.mocks';
import { UnauthorizedException } from '@nestjs/common';

describe('PasswordTokenService', () => {
  let service: PasswordTokenService;

  const mockRepo = {
    create: jest.fn().mockReturnValue(mockPasswordToken.mockTokenPassword),
    save: jest.fn().mockReturnValue(mockPasswordToken.mockTokenPasswordModel),
    delete: jest.fn().mockReturnValue({ affected: 1 }),
    findOne: jest
      .fn()
      .mockReturnValue(mockPasswordToken.mockTokenPasswordModel),
  };

  const mockUserService = {
    getUserByEmail: jest.fn().mockReturnValue(mockUserModel),
  };

  const mockMailerServices = {
    sendMail: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordTokenService,
        { provide: getRepositoryToken(PasswordToken), useValue: mockRepo },
        { provide: UsersService, useValue: mockUserService },
        { provide: MailerService, useValue: mockMailerServices },
      ],
    }).compile();

    service = module.get<PasswordTokenService>(PasswordTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When generating password token', () => {
    it('should create the password tocken', async () => {
      const userEmail = mockUserModel.email;
      await service.generatePasswordToken(userEmail);
      expect(mockRepo.save).toBeCalledWith(mockPasswordToken.mockTokenPassword);
    });
  });

  describe('When validating password token', () => {
    it('should throw error when the input email is different from the email of the user token code owner', async () => {
      const userEmail = mockUserModel.email;
      const mockUserModelDifferentEmail = mockUserModel;
      mockUserModelDifferentEmail.email = 'different';
      mockUserService.getUserByEmail = jest
        .fn()
        .mockReturnValue(mockUserModelDifferentEmail);

      const token = mockPasswordToken.mockTokenPasswordModel.token;

      try {
        await service.validatePasswordToken(token, userEmail);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe(
          'Email passed not coincides with password token email owner',
        );
      }
    });

    it('should throw error when the input email is different from the email of the user token code owner', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(undefined);

      const userEmail = mockUserModel.email;
      const token = mockPasswordToken.mockTokenPasswordModel.token;

      try {
        await service.validatePasswordToken(token, userEmail);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Token code not exist');
      }
    });

    it('should throw error when tocken code is expired', async () => {
      const expiredMockPasswordTocken =
        mockPasswordToken.mockTokenPasswordModel;
      expiredMockPasswordTocken.endTime = new Date(Date.now());

      mockRepo.findOne = jest.fn().mockReturnValue(expiredMockPasswordTocken);

      const userEmail = mockUserModel.email;
      const token = mockPasswordToken.mockTokenPasswordModel.token;

      try {
        await service.validatePasswordToken(token, userEmail);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Password token is exprired');
      }
    });
  });

  describe('When deleting expired password token', () => {
    it('should delete the token', async () => {
      const token = mockPasswordToken.mockTokenPasswordModel.token;
      await service.deleteToken(token);
      expect(mockRepo.delete).toBeCalledWith({ token });
    });
  });

  describe('While deleting expired password tokens', () => {
    it('should delete token', async () => {
      await service.deleteExpiredPasswordTokens();
    });

    it('should throw error when tokens cannot be deleted', async () => {
      console.error = jest.fn();
      mockRepo.delete = jest.fn().mockRejectedValue(new Error());
      await service.deleteExpiredPasswordTokens();
      expect(console.error).toBeCalledWith(
        'error while deleting expired password tokens',
      );
    });
  });
});
