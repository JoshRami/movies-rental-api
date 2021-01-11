import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Purchase } from './purchases.entity';
import { PurchasesService } from './purchases.service';
import * as purchasesMocks from './mocks/purchases.mocks';
import { mockUserModel } from '../users/mocks/user-mocks';
import { PurchaseDetail } from './purchases.detail.entity';
import { mockPurchaseDetailModel } from './mocks/purchases.mocks.detail';
import { Connection } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('PurchasesService', () => {
  let service: PurchasesService;

  const mockPurchaseRepo = {
    create: jest.fn().mockReturnValue(purchasesMocks.mockPurchase),
    find: jest.fn().mockReturnValue([purchasesMocks.mockPurchase]),
  };

  const mockPurchaseDetail = {
    create: jest.fn().mockReturnValue(mockPurchaseDetailModel),
  };

  const mockConnection = {
    createQueryRunner: jest.fn().mockReturnValue({
      queryRunner: jest.fn().mockImplementation(() => {
        return {
          connect: jest.fn(),
          startTransaction: jest.fn(),
          manager: jest.fn().mockReturnValue({
            save: jest.fn().mockReturnValue(1),
          }),
          commitTransaction: jest.fn(),
          rollbackTransaction: jest.fn(),
          release: jest.fn(),
        };
      }),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: getRepositoryToken(Purchase), useValue: mockPurchaseRepo },
        {
          provide: getRepositoryToken(PurchaseDetail),
          useValue: mockPurchaseDetail,
        },
        {
          provide: Connection,
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('While getting users purchases', () => {
    it('should return an users purchases', async () => {
      const user = mockUserModel;
      const purchases = await service.getUserPurchases(user);
      expect(purchases).toStrictEqual([purchasesMocks.mockPurchase]);
    });

    it('should throw error when user dont have purchases', async () => {
      mockPurchaseRepo.find = jest.fn().mockReturnValue([]);
      const user = mockUserModel;
      try {
        await service.getUserPurchases(user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          'Purchases not found: The user have not made any purchase yet',
        );
      }
    });
  });
});
