import { mockUserModel } from '../../../users/mocks/user-mocks';
import { PasswordToken } from '../passwords-token.entity';

export const mockTokenPassword = {
  token: 2021,
  endTime: new Date(Date.now() * 2),
  user: mockUserModel,
};

export const mockTokenPasswordModel: PasswordToken = {
  id: 1,
  ...mockTokenPassword,
};
