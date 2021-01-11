import { mockUserModel } from '../../users/mocks/user-mocks';
import { Rent } from '../rents.entity';
import { mockRentDetailModel } from './rents.mocks.detail';

export const mockRent = {
  user: mockUserModel,
  createdAt: new Date('2000'),
  total: 10,
  rentDetails: [mockRentDetailModel],
};

export const mockRentModel: Rent = {
  id: 1,
  ...mockRent,
};
