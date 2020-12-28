import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as UserMocks from './mocks/user-mocks';
import { User } from './users.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockRepo = {
    create: jest.fn().mockReturnValue(UserMocks.mockUserModel),
    save: jest.fn().mockReturnValue(UserMocks.mockUserModel),
    delete: jest.fn().mockReturnValue({ affected: 1 }),
    findByCredentials: jest.fn().mockReturnValue(UserMocks.mockUserModel),
    findOne: jest.fn().mockReturnValue(UserMocks.mockUserModel),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();

    service = await module.resolve<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When create an user', () => {
    it('should create the user', async () => {
      const user = await service.createUser(UserMocks.mockAddUser);

      expect(mockRepo.create).toBeCalledWith(UserMocks.mockAddUser);
      expect(mockRepo.save).toBeCalledTimes(1);
      expect(user).toBe(UserMocks.mockUserModel);
    });
  });

  describe('When deleting an user', () => {
    it('should delete user', async () => {
      const id = UserMocks.mockUserModel.id;
      const affected = await service.deleteUser(id);

      expect(mockRepo.delete).toBeCalledWith(id);
      expect(affected).toBe(true);
    });

    it('Should trowh error when user have not been deleted', async () => {
      mockRepo.delete = jest.fn().mockReturnValue({ affected: 0 });
      const nonExistentId = -1;
      try {
        await service.deleteUser(nonExistentId);
      } catch (error) {
        expect(mockRepo.delete).toBeCalledWith(nonExistentId);
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('User to delete not found');
      }
    });
  });

  describe('When updating an user', () => {
    it('should update an user', async () => {
      mockRepo.save = jest.fn().mockReturnValue(UserMocks.mockUpdatedUserModel);
      const id = UserMocks.mockUserModel.id;
      const userUpdated = await service.updateUser(
        id,
        UserMocks.mockUpdateUserParams,
      );

      expect(mockRepo.findOne).toBeCalledWith(id);
      expect(userUpdated).toBe(UserMocks.mockUpdatedUserModel);
    });
    it('should throw error when user to update is not found', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(undefined);
      try {
        await service.updateUser(1, UserMocks.mockUpdateUserParams);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('the user to update is not found');
      }
    });
  });

  describe('When getting an user by id', () => {
    it('should get a user', async () => {
      const id = UserMocks.mockUserModel.id;

      mockRepo.findOne = jest.fn().mockReturnValue(UserMocks.mockUserModel);
      const user = await service.getUser(id);

      expect(mockRepo.findOne).toBeCalledWith(id);
      expect(user).toBe(UserMocks.mockUserModel);
    });

    it('should throw when user is not found', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(undefined);
      const nonExistentId = -1;
      try {
        await service.getUser(nonExistentId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`User not found, id: ${nonExistentId}`);
      }
    });
  });

  describe('When getting an user by credentials', () => {
    it('should get a user', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(UserMocks.mockUserModel);

      const { username, password } = UserMocks.credentials;
      const user = await service.findByCredentials(username, password);

      expect(mockRepo.findOne).toBeCalledWith({ username, password });
      expect(user).toBe(UserMocks.mockUserModel);
    });

    it('should throw when user is not found', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(undefined);
      const { username, password } = UserMocks.credentials;
      try {
        await service.findByCredentials(username, password);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
