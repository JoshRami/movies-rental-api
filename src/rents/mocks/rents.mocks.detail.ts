import { mockMovieModel } from '../../movies/mocks/movies-mocks';
import { RentDetail } from '../rents.detail.entity';
import { mockRentModel } from './rents.mocks';

export const mockRentDetail = {
  subtotal: 100,
  returnIt: true,
  movie: mockMovieModel,
  rent: mockRentModel,
};

export const mockRentDetailModel: RentDetail = {
  id: 1,
  ...mockRentDetail,
};
