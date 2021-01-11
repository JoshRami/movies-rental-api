import { mockUserModel } from '../../users/mocks/user-mocks';
import { Purchase } from '../purchases.entity';
import { mockPurchaseDetailModel } from './purchases.mocks.detail';

export const mockPurchase = {
  user: mockUserModel,
  createdAt: new Date('2000'),
  total: 10,
  purchaseDetails: [mockPurchaseDetailModel],
};

export const mockPurchaseModel: Purchase = {
  id: 1,
  ...mockPurchase,
};
