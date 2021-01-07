import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rent } from './rents.entity';
import { RentsService } from './rents.service';
import * as RentsMocks from './mocks/rents.mocks';
import { mockUserModel } from '../users/mocks/user-mocks';
import { mockMovieModel } from '../movies/mocks/movies-mocks';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('RentsService', () => {
  let service: RentsService;

  const mockRepo = {
    findOne: jest.fn().mockReturnValue(RentsMocks.mockRentTransactionModel),
    create: jest.fn().mockReturnValue(RentsMocks.mockRentTransaction),
    save: jest.fn().mockReturnValue(RentsMocks.mockRentTransactionModel),
    delete: jest.fn().mockReturnValue({ affected: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentsService,
        { provide: getRepositoryToken(Rent), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<RentsService>(RentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('While creatig a new rent transaction', () => {
    it('should insert a new transaction', async () => {
      mockRepo.findOne = jest.fn().mockReturnValue(undefined);

      const transaction = await service.insertRentTransaction(
        mockUserModel,
        mockMovieModel,
      );
      expect(transaction).toBe(RentsMocks.mockRentTransactionModel);
    });

    it('should throw an error when there is a rent by the user of the same movie', async () => {
      try {
        await service.insertRentTransaction(mockUserModel, mockMovieModel);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('You have already rent this movie');
      }
    });
  });

  describe('While deleting a rent transaction', () => {
    it('should delete a transaction', async () => {
      await service.deleteRentTransaction(1);
    });

    it('should throw an error the deleting proccess could not be delete', async () => {
      try {
        mockRepo.delete = jest.fn().mockReturnValue({ affected: 0 });
        await service.deleteRentTransaction(1);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('The rent transaction appears to not exist');
      }
    });
  });

  describe('While getting a transaction by id', () => {
    it('should return the rent transaction', async () => {
      mockRepo.findOne = jest
        .fn()
        .mockReturnValue(RentsMocks.mockRentTransactionModel);

      const transactionId = RentsMocks.mockRentTransactionModel.id;
      const transaction = await service.getRentTransactionById(transactionId);
      expect(transaction).toBe(RentsMocks.mockRentTransactionModel);
    });

    it('should throw error when transaction not exists', async () => {
      try {
        mockRepo.findOne = jest.fn().mockReturnValue(undefined);
        const transactionId = RentsMocks.mockRentTransactionModel.id;
        await service.getRentTransactionById(transactionId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('The rent transaction does not exists');
      }
    });
  });
});
