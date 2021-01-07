import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockUserModel } from '../users/mocks/user-mocks';
import { UsersService } from '../users/users.service';
import { Token } from './tokens.entity';
import { TokensService } from './tokens.service';

describe('TokensService', () => {
  let service: TokensService;
  const mockToken =
    'eyJhbGcI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4.SflKxwRJV_adQssw5c';

  const mockRepo = {
    save: jest.fn().mockReturnValue(mockToken),
    delete: jest.fn().mockReturnValue({ affected: 1 }),
    findOne: jest.fn().mockReturnValue(mockToken),
  };

  const mockUserService = {
    getUser: jest.fn().mockReturnValue(mockUserModel),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        { provide: getRepositoryToken(Token), useValue: mockRepo },
        { provide: UsersService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('While checking tokens', () => {
    it('should check token', async () => {
      await service.checkToken(mockToken);
    });
    it('should throw an exception when token is not in the whitelist', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(undefined);
      try {
        await service.checkToken(mockToken);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid token');
      }
    });
  });

  describe('While saving tokens', () => {
    it('should save token', async () => {
      const token = await service.saveToken(mockToken, 1, 600);
      expect(token).toBe(mockToken);
    });
  });

  describe('While deleting tokens', () => {
    it('should delete token', async () => {
      const affected = await service.deleteToken(mockToken);
      expect(affected).toBe(true);
    });
  });

  describe('While deleting expired tokens', () => {
    it('should delete token', async () => {
      await service.deleteExpiredTokens();
    });

    it('should throw error when tokens cannot be deleted', async () => {
      console.error = jest.fn();
      mockRepo.delete = jest.fn().mockRejectedValue(new Error());
      await service.deleteExpiredTokens();
      expect(console.error).toBeCalledWith(
        'error while deleting expired tokens',
      );
    });
  });
});
