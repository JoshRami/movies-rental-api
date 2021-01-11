import { mockMovieModel } from '../../movies/mocks/movies-mocks';
import { PurchaseDetail } from '../purchases.detail.entity';
import { mockPurchaseModel } from './purchases.mocks';

export const mockPurchaseDetailModel: PurchaseDetail = {
  id: 1,
  quantity: 2,
  subtotal: 100,
  purchase: mockPurchaseModel,
  movie: mockMovieModel,
};
