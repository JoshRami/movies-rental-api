import { mockMovieModel } from '../../movies/mocks/movies-mocks';
import { mockUserModel } from '../../users/mocks/user-mocks';
import { Rent } from '../rents.entity';

export const mockRentTransaction = {
  movie: mockMovieModel,
  user: mockUserModel,
  rentDate: new Date('2000'),
};

export const mockRentTransactionModel: Rent = {
  id: 1,
  ...mockRentTransaction,
};
