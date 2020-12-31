import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from 'src/users/users.entity';
import * as RolesMocks from './role-mocks';

export const mockAddUser: CreateUserDto = {
  username: 'Test User',
  password: '123456789',
};

export const mockUpdateUserParams: UpdateUserDto = {
  password: '123456789Updated',
};

export const mockUserModel: User = {
  id: 1,
  ...mockAddUser,
  tokens: undefined,
  role: undefined,
};

export const mockUpdatedUserModel: User = {
  id: mockUserModel.id,
  username: mockAddUser.username,
  password: 'updatedPassword',
  tokens: undefined,
  role: undefined,
};

export const credentials = {
  username: 'Test User',
  password: '123456789',
};

export const mockAdminUserModel: User = {
  id: mockUserModel.id,
  username: mockUserModel.username,
  password: mockUserModel.password,
  role: RolesMocks.AdminRole.role,
  tokens: undefined,
};

export const mockClientUserModel: User = {
  id: mockUserModel.id,
  username: mockUserModel.username,
  password: mockUserModel.password,
  role: RolesMocks.ClientRole.role,
  tokens: undefined,
};
