import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as UserMocks from './mocks/user-mocks';
import { Role } from './roles/role.entity';
import { User } from './users.entity';
import { UsersService } from './users.service';
import * as RolesMock from './mocks/role-mocks';
import { Roles } from './roles/roles.enum';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepo = {
    create: jest.fn().mockReturnValue(UserMocks.mockUserModel),
    save: jest.fn().mockReturnValue(UserMocks.mockUserModel),
    delete: jest.fn().mockReturnValue({ affected: 1 }),
    findByCredentials: jest.fn().mockReturnValue(UserMocks.mockUserModel),
    findOne: jest.fn().mockReturnValue(UserMocks.mockUserModel),
  };
  const mockRoleRepo = {
    findOne: jest.fn().mockReturnValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Role), useValue: mockRoleRepo },
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

      expect(mockUserRepo.create).toBeCalledWith(UserMocks.mockAddUser);
      expect(mockUserRepo.save).toBeCalledTimes(1);
      expect(user).toBe(UserMocks.mockUserModel);
    });
  });

  describe('When deleting an user', () => {
    it('should delete user', async () => {
      const id = UserMocks.mockUserModel.id;
      const affected = await service.deleteUser(id);

      expect(mockUserRepo.delete).toBeCalledWith(id);
      expect(affected).toBe(true);
    });

    it('Should trowh error when user have not been deleted', async () => {
      mockUserRepo.delete = jest.fn().mockReturnValue({ affected: 0 });
      const nonExistentId = -1;
      try {
        await service.deleteUser(nonExistentId);
      } catch (error) {
        expect(mockUserRepo.delete).toBeCalledWith(nonExistentId);
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('User to delete not found');
      }
    });
  });

  describe('When updating an user', () => {
    it('should update an user', async () => {
      mockUserRepo.save = jest
        .fn()
        .mockReturnValue(UserMocks.mockUpdatedUserModel);
      const id = UserMocks.mockUserModel.id;
      const userUpdated = await service.updateUser(
        id,
        UserMocks.mockUpdateUserParams,
      );

      expect(mockUserRepo.findOne).toBeCalledWith(id);
      expect(userUpdated).toBe(UserMocks.mockUpdatedUserModel);
    });
    it('should throw error when user to update is not found', async () => {
      mockUserRepo.findOne = jest.fn().mockReturnValue(undefined);
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

      mockUserRepo.findOne = jest.fn().mockReturnValue(UserMocks.mockUserModel);
      const user = await service.getUser(id);

      expect(mockUserRepo.findOne).toBeCalledWith(id, {
        relations: ['role'],
      });
      expect(user).toBe(UserMocks.mockUserModel);
    });

    it('should throw when user is not found', async () => {
      mockUserRepo.findOne = jest.fn().mockReturnValue(undefined);
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
      mockUserRepo.findOne = jest.fn().mockReturnValue(UserMocks.mockUserModel);

      const { username, password } = UserMocks.credentials;
      const user = await service.findByCredentials(username, password);

      expect(mockUserRepo.findOne).toBeCalledWith({ username, password });
      expect(user).toBe(UserMocks.mockUserModel);
    });

    it('should throw when user is not found', async () => {
      mockUserRepo.findOne = jest.fn().mockReturnValue(undefined);
      const { username, password } = UserMocks.credentials;
      try {
        await service.findByCredentials(username, password);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('When validating admin role', () => {
    it('should NOT throw error when user is admin', async () => {
      mockUserRepo.findOne = jest
        .fn()
        .mockReturnValue(UserMocks.mockAdminUserModel);

      const id = UserMocks.mockUserModel.id;
      await service.verifyAdmin(id);
    });

    it('should throw error when user is NOT admin', async () => {
      mockUserRepo.findOne = jest
        .fn()
        .mockReturnValue(UserMocks.mockClientUserModel);

      const id = UserMocks.mockUserModel.id;
      try {
        await service.verifyAdmin(id);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Sorry only admins can perform this action');
      }
    });
  });

  describe('When changing the rol to an user', () => {
    it('should throw an error when changing the rol to an user wich is already assigned', async () => {
      service.getUser = jest
        .fn()
        .mockReturnValue(UserMocks.mockClientUserModel);

      mockRoleRepo.findOne = jest
        .fn()
        .mockReturnValue(RolesMock.ClientRole.role);

      const id = UserMocks.mockClientUserModel.id;
      try {
        await service.changeUserRole(id, { role: Roles.Client });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(
          `The user with id: ${id} already has role: ${Roles.Client}`,
        );
      }
    });

    it('should change an user rol from client to admin', async () => {
      service.getUser = jest
        .fn()
        .mockReturnValue(UserMocks.mockClientUserModel);

      mockRoleRepo.findOne = jest
        .fn()
        .mockReturnValue(RolesMock.AdminRole.role);

      mockUserRepo.save = jest
        .fn()
        .mockReturnValue(UserMocks.mockAdminUserModel);

      const id = UserMocks.mockClientUserModel.id;
      const updatedUser = await service.changeUserRole(id, {
        role: Roles.Admin,
      });
      expect(updatedUser.role.role).toBe(Roles.Admin);
    });
  });
});
