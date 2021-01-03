import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rent } from './rents.entity';
import { RentsService } from './rents.service';
import * as RentsMocks from './mocks/rents.mocks';
import { mockUserModel } from '../users/mocks/user-mocks';
import { mockMovieModel } from '../movies/mocks/movies-mocks';
import { ConflictException } from '@nestjs/common';

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
      await service.deleteRentTransaction(mockUserModel, mockMovieModel);
    });

    it('should throw an error the deleting proccess could not be delete', async () => {
      try {
        mockRepo.delete = jest.fn().mockReturnValue({ affected: 0 });
        await service.deleteRentTransaction(mockUserModel, mockMovieModel);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('The rent transaction appears to not exist');
      }
    });
  });
});
