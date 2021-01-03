import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Purchase } from './purchases.entity';
import { PurchasesService } from './purchases.service';
import * as purchasesMocks from './mocks/purchases.mocks';
import { mockUserModel } from '../users/mocks/user-mocks';
import { mockMovieModel } from '../movies/mocks/movies-mocks';

describe('PurchasesService', () => {
  let service: PurchasesService;
  const mockRepo = {
    create: jest.fn().mockReturnValue(purchasesMocks.purchase),
    save: jest.fn().mockReturnValue(purchasesMocks.purchaseModel),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: getRepositoryToken(Purchase), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('When creatin a purchase transaction', () => {
    it('should create a new transaction', async () => {
      const purchaseTransaction = await service.insertPurchaseTransaction(
        mockUserModel,
        mockMovieModel,
      );
      expect(purchaseTransaction).toBe(purchasesMocks.purchaseModel);
    });
  });
});
