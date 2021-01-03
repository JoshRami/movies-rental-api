import { mockMovieModel } from '../../movies/mocks/movies-mocks';
import { mockUserModel } from '../../users/mocks/user-mocks';
import { Purchase } from '../purchases.entity';

export const mockPurchase = {
  user: mockUserModel,
  movie: mockMovieModel,
  purchasesPrice: mockMovieModel.salePrice,
  rentDate: new Date('2000'),
};

export const mockPurchaseModel: Purchase = {
  id: 1,
  ...mockPurchase,
};
