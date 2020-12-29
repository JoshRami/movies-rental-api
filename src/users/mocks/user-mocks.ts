import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from 'src/users/users.entity';

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
};

export const mockUpdatedUserModel: User = {
  id: mockUserModel.id,
  username: mockAddUser.username,
  password: 'updatedPassword',
  tokens: undefined,
};

export const credentials = {
  username: 'Test User',
  password: '123456789',
};
